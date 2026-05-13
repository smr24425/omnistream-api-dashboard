import React, { useState, useEffect, useCallback } from 'react';
import styles from './TopologyPanel.module.scss';
import { useCanvasEngine } from '../../../hooks/useCanvasEngine';
import { PanelHeader } from '../../ui/PanelHeader/PanelHeader';
import { dataManager } from '../../../engine/DataManager';
import { ErrorMessage } from '../../ui/ErrorMessage/ErrorMessage';
import { CHART_COLORS, withAlpha } from '../../../config/chartThemes';

interface TopologyPanelProps {
  id: string;
  title: string;
  metricName?: string;
  unit?: string;
  settings?: Record<string, any>;
  onDelete?: () => void;
}

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  status: 'online' | 'offline' | 'warning';
}

interface Link {
  source: string;
  target: string;
}

export const TopologyPanel: React.FC<TopologyPanelProps> = ({ id, title, onDelete }) => {
  const [, forceUpdate] = useState({});
  
  // 模擬數據 (未來可從 DataManager 獲取)
  const nodes: Node[] = [
    { id: '1', x: 0.25, y: 0.3, label: 'Gateway-01', status: 'online' },
    { id: '2', x: 0.75, y: 0.3, label: 'Auth-Service', status: 'online' },
    { id: '3', x: 0.5, y: 0.7, label: 'Main-DB', status: 'warning' },
  ];
  
  const links: Link[] = [
    { source: '1', target: '2' },
    { source: '2', target: '3' },
    { source: '1', target: '3' },
  ];

  const handleDraw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, timestamp: number) => {
    ctx.clearRect(0, 0, width, height);

    // 繪製連線
    ctx.strokeStyle = withAlpha(CHART_COLORS.accent, 0.2);
    ctx.lineWidth = 1.5;
    links.forEach(link => {
      const s = nodes.find(n => n.id === link.source)!;
      const t = nodes.find(n => n.id === link.target)!;
      ctx.beginPath();
      ctx.moveTo(s.x * width, s.y * height);
      ctx.lineTo(t.x * width, t.y * height);
      ctx.stroke();
    });

    // 繪製節點
    nodes.forEach(node => {
      const nx = node.x * width;
      const ny = node.y * height;
      
      const pulse = Math.sin(timestamp / 600) * 4;
      const color = node.status === 'online'
        ? CHART_COLORS.success
        : (node.status === 'warning' ? CHART_COLORS.warning : CHART_COLORS.danger);

      const gradient = ctx.createRadialGradient(nx, ny, 5, nx, ny, 25 + pulse);
      gradient.addColorStop(0, withAlpha(color, 0.27));
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(nx, ny, 25 + pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(nx, ny, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = CHART_COLORS.white;
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, nx, ny + 30);
    });
  }, [nodes, links]);

  const { containerRef, registerLayer } = useCanvasEngine({
    onDraw: handleDraw
  });

  useEffect(() => {
    const unsubscribe = dataManager.subscribe(id, () => {
      forceUpdate({});
    });
    return () => { unsubscribe(); };
  }, [id]);

  const dynamicLayerRef = useCallback((el: HTMLCanvasElement | null) => {
    registerLayer('dynamic', el);
  }, [registerLayer]);

  const error = dataManager.getPanelError(id);

  return (
    <div className={styles.panelContainer}>
      <PanelHeader title={title} badge="CANVAS" onDelete={onDelete} />
      <div ref={containerRef} className={styles.canvasWrapper}>
        <canvas ref={dynamicLayerRef} className={styles.canvas} />
        {error && <ErrorMessage message={error} />}
      </div>
    </div>
  );
};
