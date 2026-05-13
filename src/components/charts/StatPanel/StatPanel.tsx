import React, { useEffect, useState } from 'react';
import { dataManager } from '../../../engine/DataManager';
import styles from './StatPanel.module.scss';
import { PanelHeader } from '../../ui/PanelHeader/PanelHeader';
import { CHART_COLORS } from '../../../config/chartThemes';

interface StatPanelProps {
  id: string;
  title: string;
  metricName?: string;
  unit?: string;
  settings?: Record<string, any>;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const StatPanel: React.FC<StatPanelProps> = ({ id, title, metricName, unit, settings, onDelete, onEdit }) => {
  const [, forceUpdate] = useState({});
  const panelData = dataManager.getPanelData(id);
  const metricList = panelData ? Array.from(panelData.values()) : [];
  const fullHistory = metricList[0] || [];
  
  const value = fullHistory.length > 0 ? fullHistory[fullHistory.length - 1].y : 0;
  const trend = fullHistory.slice(-20); // 僅用於計算趨勢的視圖

  const precision = settings?.precision ?? 1;

  useEffect(() => {
    const unsubscribe = dataManager.subscribe(id, () => {
      forceUpdate({});
    });
    return () => unsubscribe();
  }, [id]);


  // 計算趨勢百分比 (對比歷史第一點與最後一點)
  const getChange = () => {
    if (trend.length < 2) return { val: 0, isUp: true };
    const first = trend[0].y;
    const last = trend[trend.length - 1].y;
    const diff = last - first;
    const percent = (diff / (first || 1)) * 100;
    return { val: Math.abs(percent), isUp: diff >= 0 };
  };

  const change = getChange();
  const trendColor = change.isUp ? CHART_COLORS.success : CHART_COLORS.danger;

  return (
    <div className={styles.panelContainer}>
      <PanelHeader
        title={title}
        badge="STAT"
        onDelete={onDelete}
        onEdit={onEdit}
      />

      <div className={styles.content}>
        <div className={styles.mainValue}>
          {value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}
          {unit && <span className={styles.unit}>{unit}</span>}
        </div>
        <div className={styles.footer}>
          <span className={styles.trendLabel} style={{ color: trendColor }}>
            {change.isUp ? '▲' : '▼'} {change.val.toFixed(2)}%
          </span>
          <span className={styles.subtext}>{metricName || 'vs start'}</span>
        </div>
      </div>
    </div>
  );
};
