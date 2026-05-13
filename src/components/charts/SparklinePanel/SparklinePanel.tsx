import React, { useEffect, useState } from 'react';
import { dataManager } from '../../../engine/DataManager';
import type { DataPoint } from '../../../engine/DataManager';
import { PanelHeader } from '../../ui/PanelHeader/PanelHeader';
import styles from './SparklinePanel.module.scss';
import { ChartTooltip } from '../../ui/ChartTooltip/ChartTooltip';

interface SparklinePanelProps {
  id: string;
  title: string;
  metricName?: string;
  unit?: string;
  settings?: Record<string, any>;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const SparklinePanel: React.FC<SparklinePanelProps> = ({ id, title, metricName, unit, settings, onDelete, onEdit }) => {
  const [hoverData, setHoverData] = useState<{ visible: boolean; x: number; y: number; p?: DataPoint } | null>(null);
  const [, forceUpdate] = useState({});
  const panelData = dataManager.getPanelData(id);
  const metricList = panelData ? Array.from(panelData.values()) : [];
  
  const allPoints = metricList[0] || [];
  // 畫面僅渲染最新 40 點，維持效能與視覺密度
  const points = allPoints.slice(-40);

  const precision = settings?.precision ?? 1;

  useEffect(() => {
    const unsubscribe = dataManager.subscribe(id, () => {
      forceUpdate({});
    });
    return () => unsubscribe();
  }, [id]);

  // 【抗跳動演算法】
  // 1. 使用過去 120 筆資料來計算刻度範圍，避免極端值剛離開可見視窗時導致的劇烈跳動
  const scalePoints = allPoints.slice(-120);
  const rawMin = scalePoints.length > 0 ? Math.min(...scalePoints.map(p => p.y)) : 0;
  const rawMax = scalePoints.length > 0 ? Math.max(...scalePoints.map(p => p.y)) : 100;

  // 2. 增加 10% 的視覺緩衝留白 (Padding)，讓圖表看起來不擁擠
  let padding = (rawMax - rawMin) * 0.1;
  if (padding === 0) padding = 1; // 避免完全相同的數值導致 padding 為 0

  const minY = rawMin - padding;
  const maxY = rawMax + padding;
  const range = maxY - minY;

  // 是否存在負數（決定是否顯示零線）
  const hasNegative = minY < 0;
  // 零線在圖表高度中的百分比位置（top 方向）
  const zeroLineTop = hasNegative ? ((maxY / range) * 100) : null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // 計算最接近的點索引
    const index = Math.floor((x / rect.width) * points.length);
    const safeIndex = Math.max(0, Math.min(index, points.length - 1));
    const p = points[safeIndex];

    // 計算 Tooltip 位置 (在該長條的正上方)
    const barX = (safeIndex / points.length) * rect.width + (rect.width / points.length / 2);
    const valRatio = range === 0 ? 1 : Math.max(0, Math.min(1, (p.y - minY) / range));
    const barY = rect.height - valRatio * rect.height;

    setHoverData({ visible: true, x: barX, y: barY, p });
  };

  return (
    <div className={styles.panelContainer} data-panel-id={id} onMouseLeave={() => setHoverData(null)}>
      <PanelHeader
        title={title}
        badge={'SPARK'}
        onDelete={onDelete}
        onEdit={onEdit}
      />

      <div className={styles.chartArea} onMouseMove={handleMouseMove}>
        {points.map((p, i) => {
          const zeroRatio = range === 0 ? 0 : Math.max(0, Math.min(1, (0 - minY) / range));
          const valRatio = range === 0 ? 1 : Math.max(0, Math.min(1, (p.y - minY) / range));

          let top, bottom;
          if (p.y >= 0) {
            bottom = zeroRatio * 100;
            top = (1 - valRatio) * 100;
          } else {
            bottom = valRatio * 100;
            top = (1 - zeroRatio) * 100;
          }

          const isHovered = hoverData?.visible && points.indexOf(hoverData.p!) === i;
          return (
            <div key={p.x || i} className={styles.barWrapper}>
              <div
                className={`${styles.bar} ${isHovered ? styles.active : ''} ${p.y < 0 ? styles.negative : ''}`}
                style={{ top: `${top}%`, bottom: `${bottom}%` }}
              />
            </div>
          );
        })}

        {/* 零點基準線：只有包含負數時才渲染 */}
        {zeroLineTop !== null && (
          <div
            className={styles.zeroLine}
            style={{ top: `${zeroLineTop}%` }}
          />
        )}

        <div className={styles.yLabels}>
          <span>{maxY.toFixed(precision)}</span>
          <span>{minY.toFixed(precision)}</span>
        </div>

        {hoverData?.p && (
          <ChartTooltip
            visible={hoverData.visible}
            x={hoverData.x}
            label={metricName || title}
            value={hoverData.p.y.toFixed(precision)}
            unit={unit}
            time={new Date(hoverData.p.x).toLocaleTimeString()}
          />
        )}
      </div>
    </div>
  );
};
