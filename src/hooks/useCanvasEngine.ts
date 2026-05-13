import { useEffect, useRef, useCallback } from 'react';
import { renderLoop } from '../engine/RenderLoop';

interface CanvasEngineOptions {
  onDraw?: (ctx: CanvasRenderingContext2D, width: number, height: number, timestamp: number) => void;
  onResize?: (width: number, height: number) => void;
  isPaused?: boolean;
}

/**
 * useCanvasEngine - 專業級 Canvas 渲染基礎 Hook
 * 處理 DPR 縮放, 自動 Resize, 多層畫布同步, 以及 RenderLoop 註冊
 */
export const useCanvasEngine = (options: CanvasEngineOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const layersRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

  const syncLayer = useCallback((canvas: HTMLCanvasElement) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    const newWidth = Math.round(width * dpr);
    const newHeight = Math.round(height * dpr);

    // 關鍵修復：只有在尺寸真正變更時才重設寬高，避免誤刪內容
    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        (ctx as any).imageSmoothingEnabled = false;
      }
    }
  }, []);

  const registerLayer = useCallback((name: string, el: HTMLCanvasElement | null) => {
    if (el) {
      layersRef.current.set(name, el);
      syncLayer(el);
    } else {
      layersRef.current.delete(name);
    }
  }, [syncLayer]);

  const handleResize = useCallback(() => {
    if (!containerRef.current || layersRef.current.size === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    if (width <= 0 || height <= 0) return;

    layersRef.current.forEach(syncLayer);
    sizeRef.current = { width, height };
    options.onResize?.(width, height);
  }, [options, syncLayer]);

  const onDrawRef = useRef(options.onDraw);
  
  // 保持回調最新，但不觸發 Effect 重新運行
  useEffect(() => {
    onDrawRef.current = options.onDraw;
  }, [options.onDraw]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const internalDraw = (_deltaTime: number, timestamp: number) => {
      if (options.isPaused) return;
      
      const dynamicLayer = layersRef.current.get('dynamic');
      if (dynamicLayer) {
        const ctx = dynamicLayer.getContext('2d');
        if (ctx) {
          onDrawRef.current?.(ctx, sizeRef.current.width, sizeRef.current.height, timestamp);
        }
      }
    };

    const unregister = renderLoop.register(internalDraw);

    return () => {
      resizeObserver.disconnect();
      unregister();
    };
  }, [handleResize, options.isPaused]); // 移除了 options.onDraw 依賴

  return {
    containerRef,
    registerLayer,
    size: sizeRef.current,
    getLayerContext: (name: string) => layersRef.current.get(name)?.getContext('2d')
  };
};
