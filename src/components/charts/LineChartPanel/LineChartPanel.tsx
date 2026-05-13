import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './LineChartPanel.module.scss';
import { useCanvasEngine } from '../../../hooks/useCanvasEngine';
import { dataManager } from '../../../engine/DataManager';
import type { DataPoint } from '../../../engine/DataManager';
import { lttb } from '../../../engine/utils/lttb';
import { CHART_COLORS, getPaletteColor, withAlpha } from '../../../config/chartThemes';
import { PanelHeader } from '../../ui/PanelHeader/PanelHeader';
import { ErrorMessage } from '../../ui/ErrorMessage/ErrorMessage';
import { ChartTooltip } from '../../ui/ChartTooltip/ChartTooltip';
import type { TooltipItem } from '../../ui/ChartTooltip/ChartTooltip';

interface LineChartPanelProps {
  id: string;
  title: string;
  metricName?: string;
  unit?: string;
  settings?: Record<string, any>;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const LineChartPanel: React.FC<LineChartPanelProps> = ({ id, title, settings, onDelete, onEdit }) => {
  const [, forceUpdate] = useState({});
  const [hoverData, setHoverData] = useState<{ visible: boolean; x: number; time: string; items: TooltipItem[] }>({
    visible: false, x: 0, time: '', items: []
  });

  const lastPointsRef = useRef<Map<string, DataPoint[]>>(new Map());
  const scaleInfoRef = useRef({
    minX: 0, maxX: 0, timeRange: 0,
    minY: 0, maxY: 0, chartMinY: 0, chartMaxY: 0, chartRange: 0,
    logicalWidth: 0, logicalHeight: 0
  });

  const lastProcessedCount = useRef<Map<string, number>>(new Map());
  const cachedDisplayPoints = useRef<Map<string, DataPoint[]>>(new Map());

  const handleDraw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const panelData = dataManager.getPanelData(id);
    if (!panelData || panelData.size === 0) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    const allMetrics = Array.from(panelData.keys());
    const displayMap = new Map<string, DataPoint[]>();

    allMetrics.forEach(name => {
      const raw = panelData.get(name) || [];
      if (raw.length < 2) return;
      if (lastProcessedCount.current.get(name) !== raw.length) {
        const sorted = [...raw].sort((a, b) => a.x - b.x);
        cachedDisplayPoints.current.set(name, lttb(sorted, 500));
        lastProcessedCount.current.set(name, raw.length);
      }
      displayMap.set(name, cachedDisplayPoints.current.get(name)!);
    });

    if (displayMap.size === 0) return;
    lastPointsRef.current = displayMap;

    let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
    displayMap.forEach((points) => {
      points.forEach(p => {
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      });
    });

    const hasUserMin = settings?.yMin !== undefined && settings?.yMin !== '';
    const hasUserMax = settings?.yMax !== undefined && settings?.yMax !== '';
    const finalMinY = hasUserMin ? Number(settings.yMin) : minY;
    const finalMaxY = hasUserMax ? Number(settings.yMax) : maxY;

    const yRange = (finalMaxY - finalMinY) || 1;
    const padding = yRange * 0.15;
    const chartMinY = hasUserMin ? finalMinY : (minY - padding);
    const chartMaxY = hasUserMax ? finalMaxY : (maxY + padding);
    const chartRange = (chartMaxY - chartMinY) || 1;
    const timeRange = (maxX - minX) || 1;

    scaleInfoRef.current = {
      minX, maxX, timeRange, minY: finalMinY, maxY: finalMaxY, chartMinY, chartMaxY, chartRange,
      logicalWidth: width, logicalHeight: height
    };

    const PADDING_LEFT = 50;
    const PADDING_BOTTOM = 20;
    const chartWidth = width - PADDING_LEFT - 20;
    const chartHeight = height - PADDING_BOTTOM - 10;

    const getX = (tx: number) => PADDING_LEFT + ((tx - minX) / timeRange) * chartWidth;
    const getY = (ty: number) => chartHeight + 10 - ((ty - chartMinY) / chartRange) * chartHeight;

    ctx.clearRect(0, 0, width, height);

    // 1. 繪製橫向網格與 Y 軸標籤
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 1;

    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const val = chartMinY + (chartRange * i) / gridSteps;
      const py = getY(val);
      
      // 網格線
      ctx.beginPath();
      ctx.moveTo(PADDING_LEFT, py);
      ctx.lineTo(width - 20, py);
      ctx.stroke();

      // Y 軸數值
      const dPoints = allMetrics.length > 0 ? displayMap.get(allMetrics[0]) : null;
      const displayUnit = (dPoints && dPoints[0]?.unit) || '';
      
      ctx.fillText(`${val.toFixed(1)}${displayUnit}`, PADDING_LEFT - 8, py);
    }

    // 2. 繪製折線數據
    allMetrics.forEach((name, idx) => {
      const dPoints = displayMap.get(name);
      if (!dPoints || dPoints.length < 2) return;
      const color = getPaletteColor(idx);

      // 填滿區域
      ctx.beginPath();
      dPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(getX(p.x), getY(p.y));
        else ctx.lineTo(getX(p.x), getY(p.y));
      });
      ctx.lineTo(getX(dPoints[dPoints.length - 1].x), chartHeight + 10);
      ctx.lineTo(getX(dPoints[0].x), chartHeight + 10);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, `${color}20`);
      gradient.addColorStop(1, `${color}00`);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 主曲線
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      dPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(getX(p.x), getY(p.y));
        else ctx.lineTo(getX(p.x), getY(p.y));
      });
      ctx.stroke();
      ctx.restore();
    });
  }, [id, settings]);

  const { containerRef, registerLayer, getLayerContext } = useCanvasEngine({
    onDraw: handleDraw
  });

  useEffect(() => {
    const unsubscribe = dataManager.subscribe(id, () => forceUpdate({}));
    return () => { unsubscribe(); };
  }, [id]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const PADDING_LEFT = 50;
    const PADDING_BOTTOM = 20;
    const { minX, timeRange, chartMinY, chartRange, logicalWidth: width, logicalHeight: height } = scaleInfoRef.current;
    if (!width || lastPointsRef.current.size === 0) return;

    const chartWidth = width - PADDING_LEFT - 20;
    const chartHeight = height - PADDING_BOTTOM - 10;

    // 計算滑鼠相對於繪圖區的 X (減去 Padding)
    const relativeX = Math.max(0, Math.min(chartWidth, e.clientX - rect.left - PADDING_LEFT));
    const targetTime = minX + (relativeX / chartWidth) * timeRange;

    const tooltipItems: TooltipItem[] = [];
    const highlightPoints: { py: number, color: string }[] = [];
    let commonTime = '';

    let colorIdx = 0;
    lastPointsRef.current.forEach((points, name) => {
      let closest = points[0];
      points.forEach(p => {
        if (Math.abs(p.x - targetTime) < Math.abs(closest.x - targetTime)) closest = p;
      });

      const color = getPaletteColor(colorIdx++);
      const py = chartHeight + 10 - ((closest.y - chartMinY) / chartRange) * chartHeight;
      if (!commonTime) commonTime = new Date(closest.x).toLocaleTimeString();

      tooltipItems.push({
        label: name,
        value: closest.y.toLocaleString(undefined, { minimumFractionDigits: settings?.precision ?? 2 }),
        unit: closest.unit || '',
        color
      });
      highlightPoints.push({ py, color });
    });

    const ctx = getLayerContext('interaction');
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      const canvasX = PADDING_LEFT + relativeX;
      
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = withAlpha(CHART_COLORS.white, 0.2);
      ctx.beginPath(); 
      ctx.moveTo(canvasX, 10); 
      ctx.lineTo(canvasX, chartHeight + 10); 
      ctx.stroke();
      ctx.setLineDash([]);

      highlightPoints.forEach(pt => {
        ctx.fillStyle = pt.color; ctx.strokeStyle = CHART_COLORS.white; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(canvasX, pt.py, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
    }

    setHoverData({ visible: true, x: rect.left + PADDING_LEFT + relativeX, time: commonTime, items: tooltipItems });
  };

  const handleMouseLeave = () => {
    const ctx = getLayerContext('interaction');
    if (ctx) ctx.clearRect(0, 0, scaleInfoRef.current.logicalWidth, scaleInfoRef.current.logicalHeight);
    setHoverData(prev => ({ ...prev, visible: false }));
  };

  const dynamicLayerRef = useCallback((el: HTMLCanvasElement | null) => {
    registerLayer('dynamic', el);
  }, [registerLayer]);

  const interactionLayerRef = useCallback((el: HTMLCanvasElement | null) => {
    registerLayer('interaction', el);
  }, [registerLayer]);

  const error = dataManager.getPanelError(id);

  return (
    <div className={styles.panelContainer}>
      <PanelHeader title={title} badge="LIVE" onDelete={onDelete} onEdit={onEdit} />
      <div 
        ref={containerRef} 
        className={styles.canvasWrapper} 
        onMouseMove={handleMouseMove} 
        onMouseLeave={handleMouseLeave}
      >
        <canvas ref={dynamicLayerRef} className={styles.canvas} />
        <canvas ref={interactionLayerRef} className={styles.canvas} />
        {error && <ErrorMessage message={error} />}
        {hoverData.visible && <ChartTooltip {...hoverData} />}
      </div>
    </div>
  );
};
