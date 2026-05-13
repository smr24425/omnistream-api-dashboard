import React, { useState, useEffect, useMemo } from 'react';
import styles from './DonutPanel.module.scss';
import { dataManager } from '../../../engine/DataManager';
import { PanelHeader } from '../../ui/PanelHeader/PanelHeader';
import { useTranslation } from 'react-i18next';
import { getPaletteColor } from '../../../config/chartThemes';


interface DonutPanelProps {
  id: string;
  title: string;
  metricName?: string;
  unit?: string;
  settings?: Record<string, any>;
  onDelete?: () => void;
  onEdit?: () => void;
}

interface Segment {
  name: string;
  value: number;
  unit?: string;
  color: string;
  startAngle: number;
  endAngle: number;
  percentage: number;
}

/** 將角度 + 半徑 轉換成 SVG 路徑中的 (x, y) 座標 */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/** 產生單一扇形的 SVG 路徑字串 */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  // 避免整圈 360° 時 SVG 無法繪製的邊界情況
  const safeEnd = endAngle >= startAngle + 360 ? startAngle + 359.999 : endAngle;
  const start = polarToCartesian(cx, cy, r, safeEnd);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = safeEnd - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export const DonutPanel: React.FC<DonutPanelProps> = ({ id, title, settings, onDelete, onEdit }) => {
  const { t } = useTranslation();
  const [, forceUpdate] = useState({});
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const precision = settings?.precision ?? 1;

  // 訂閱 dataManager 資料更新
  useEffect(() => {
    const unsubscribe = dataManager.subscribe(id, () => forceUpdate({}));
    return () => unsubscribe();
  }, [id]);

  const panelData = dataManager.getPanelData(id);

  // 將 Map<metricName, DataPoint[]> 轉換為各指標最新值
  const rawItems = useMemo(() => {
    if (!panelData || panelData.size === 0) return [];
    return Array.from(panelData.entries()).map(([name, history]) => {
      const latest = history[history.length - 1];
      return {
        name,
        value: Math.max(0, typeof latest?.y === 'number' ? latest.y : 0),
        unit: latest?.unit,
      };
    });
  }, [panelData]);

  // 計算各扇形的角度範圍
  const segments: Segment[] = useMemo(() => {
    const total = rawItems.reduce((s, d) => s + d.value, 0);
    if (total === 0) return [];

    let currentAngle = 0;
    return rawItems.map((item, i) => {
      const pct = (item.value / total) * 100;
      const sweep = (item.value / total) * 360;
      const seg: Segment = {
        ...item,
        color: getPaletteColor(i),
        startAngle: currentAngle,
        endAngle: currentAngle + sweep,
        percentage: pct,
      };
      currentAngle += sweep;
      return seg;
    });
  }, [rawItems]);

  const total = rawItems.reduce((s, d) => s + d.value, 0);

  // SVG 尺寸設定
  const CX = 80;
  const CY = 80;
  const R_OUTER = 62;
  const R_INNER = 40; // 環形中空半徑
  const STROKE_WIDTH = R_OUTER - R_INNER;

  return (
    <div className={styles.panelContainer} data-panel-id={id}>
      <PanelHeader title={title} badge="DONUT" onDelete={onDelete} onEdit={onEdit} />

      <div className={styles.content}>
        {segments.length === 0 ? (
          <div className={styles.empty}>{t('dashboard.empty')}</div>
        ) : (
          <div className={styles.chartLayout}>
            {/* SVG 環狀圖 */}
            <div className={styles.svgWrapper}>
              <svg viewBox="0 0 160 160" className={styles.svg}>
                {/* 底層灰色環形軌道 */}
                <circle
                  cx={CX}
                  cy={CY}
                  r={(R_OUTER + R_INNER) / 2}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={STROKE_WIDTH}
                />

                {/* 各指標扇形 */}
                {segments.map((seg, i) => {
                  const isHovered = hoveredIndex === i;
                  const midAngle = (seg.startAngle + seg.endAngle) / 2;
                  const offsetR = isHovered ? 5 : 0;
                  const midRad = ((midAngle - 90) * Math.PI) / 180;
                  const dx = offsetR * Math.cos(midRad);
                  const dy = offsetR * Math.sin(midRad);

                  return (
                    <path
                      key={seg.name}
                      d={describeArc(CX, CY, (R_OUTER + R_INNER) / 2, seg.startAngle, seg.endAngle)}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={isHovered ? STROKE_WIDTH + 4 : STROKE_WIDTH}
                      strokeLinecap="butt"
                      className={styles.segment}
                      style={{
                        transform: `translate(${dx}px, ${dy}px)`,
                        filter: isHovered ? `drop-shadow(0 0 8px ${seg.color})` : undefined,
                        opacity: hoveredIndex !== null && !isHovered ? 0.45 : 1,
                      }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}

                {/* 中央顯示：hover 時顯示該指標資訊，否則顯示總和 */}
                {hoveredIndex !== null && segments[hoveredIndex] ? (
                  <>
                    <text x={CX} y={CY - 8} textAnchor="middle" className={styles.centerLabel}>
                      {segments[hoveredIndex].percentage.toFixed(1)}%
                    </text>
                    <text x={CX} y={CY + 10} textAnchor="middle" className={styles.centerSub}>
                      {segments[hoveredIndex].name}
                    </text>
                  </>
                ) : (
                  <>
                    <text x={CX} y={CY - 6} textAnchor="middle" className={styles.centerValue}>
                      {total.toFixed(precision)}
                    </text>
                    <text x={CX} y={CY + 12} textAnchor="middle" className={styles.centerUnit}>
                      total
                    </text>
                  </>
                )}
              </svg>
            </div>

            {/* Legend */}
            <div className={styles.legend}>
              {segments.map((seg, i) => (
                <div
                  key={seg.name}
                  className={`${styles.legendItem} ${hoveredIndex === i ? styles.legendActive : ''}`}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className={styles.legendDot} style={{ background: seg.color }} />
                  <span className={styles.legendName}>{seg.name}</span>
                  <span className={styles.legendVal}>
                    {seg.value.toFixed(precision)}
                    {seg.unit && <span className={styles.legendUnit}>{seg.unit}</span>}
                  </span>
                  <span className={styles.legendPct}>{seg.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
