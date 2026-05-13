import React, { useState, useEffect } from 'react';
import styles from './BarChartPanel.module.scss';
import { dataManager } from '../../../engine/DataManager';
import { useTranslation } from 'react-i18next';
import { PanelHeader } from '../../ui/PanelHeader/PanelHeader';
import { getPaletteColor } from '../../../config/chartThemes';

interface BarChartPanelProps {
  id: string;
  title: string;
  metricName?: string;
  unit?: string;
  settings?: Record<string, any>;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const BarChartPanel: React.FC<BarChartPanelProps> = ({ id, title, metricName, settings, onDelete, onEdit }) => {
  const { t } = useTranslation();
  const [, forceUpdate] = useState({});
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const panelData = dataManager.getPanelData(id);

  const displayData = React.useMemo(() => {
    if (!panelData || panelData.size === 0) return [];

    const entries = Array.from(panelData.entries());

    // 依最新值由大到小排序，讓最大的在最上方
    return entries
      .map(([name, history]) => {
        const latest = history[history.length - 1];
        return {
          name,
          value: typeof latest?.y === 'number' ? latest.y : 0,
          unit: latest?.unit,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [panelData]);

  useEffect(() => {
    const unsubscribe = dataManager.subscribe(id, () => {
      forceUpdate({});
    });
    return () => unsubscribe();
  }, [id]);

  const userMax = settings?.max;
  const maxValue = userMax || Math.max(...displayData.map((d) => d.value || 0), 10);

  return (
    <div className={styles.panelContainer} data-panel-id={id}>
      <PanelHeader
        title={title}
        badge={metricName || 'BAR'}
        onDelete={onDelete}
        onEdit={onEdit}
      />

      <div className={styles.content}>
        {displayData.map((item, index) => {
          const val = item.value || 0;
          const label = item.name || `Item ${index + 1}`;
          const percentage = Math.min((val / maxValue) * 100, 100);
          const color = getPaletteColor(index);
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.name}
              className={`${styles.barRow} ${isHovered ? styles.barRowHovered : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Rank + 名稱 + 數值 */}
              <div className={styles.labelGroup}>
                <div className={styles.labelLeft}>
                  <span className={styles.rank} style={{ color }}>{index + 1}</span>
                  <span className={styles.label}>{label}</span>
                </div>
                <span className={styles.value} style={{ color: isHovered ? color : undefined }}>
                  {val.toFixed(1)}
                  {item.unit && <span className={styles.unit}>{item.unit}</span>}
                </span>
              </div>

              {/* 長條軌道 */}
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${color}99, ${color})`,
                    boxShadow: isHovered ? `0 0 12px ${color}80` : undefined,
                  }}
                >
                  <div className={styles.barSheen} />
                </div>
              </div>
            </div>
          );
        })}

        {displayData.length === 0 && (
          <div className={styles.empty}>{t('dashboard.empty')}</div>
        )}
      </div>
    </div>
  );
};
