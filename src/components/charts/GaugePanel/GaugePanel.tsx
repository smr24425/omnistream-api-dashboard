import React, { useState, useEffect } from 'react';
import styles from './GaugePanel.module.scss';
import { dataManager } from '../../../engine/DataManager';
import { useTranslation } from 'react-i18next';
import { PanelHeader } from '../../ui/PanelHeader/PanelHeader';
import { CHART_COLORS } from '../../../config/chartThemes';

interface GaugePanelProps {
  id: string;
  title: string;
  metricName?: string;
  unit?: string;
  settings?: Record<string, any>;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const GaugePanel: React.FC<GaugePanelProps> = ({ id, title, metricName, unit, settings, onDelete, onEdit }) => {
  const { t } = useTranslation();
  const [, forceUpdate] = useState({});
  const panelData = dataManager.getPanelData(id);
  const metricList = panelData ? Array.from(panelData.values()) : [];
  const latestPoint = metricList[0]?.[metricList[0].length - 1];
  const value = latestPoint?.y ?? 0;

  const min = settings?.min ?? 0;
  const max = settings?.max ?? 100;
  const range = max - min;

  // 計算百分比用於圖形顯示 (限制在 0-100)
  const percent = Math.min(Math.max(((value - min) / (range || 1)) * 100, 0), 100);

  // 計算圓弧 (半圓)
  const radius = settings?.radius ?? 70;
  const circumference = Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  useEffect(() => {
    const unsubscribe = dataManager.subscribe(id, () => {
      forceUpdate({});
    });
    return () => unsubscribe();
  }, [id]);

  // 顏色判斷
  const getColor = (p: number) => {
    const betterWhen: 'higher' | 'lower' = settings?.betterWhen === 'higher' ? 'higher' : 'lower';

    const thresholds: [number, number] = Array.isArray(settings?.thresholds) && settings.thresholds.length >= 2
      ? [Number(settings.thresholds[0]), Number(settings.thresholds[1])]
      : [60, 85];

    // 三段式：good / warn / bad
    const good = settings?.colors?.good ?? CHART_COLORS.success;
    const warn = settings?.colors?.warn ?? CHART_COLORS.warning;
    const bad = settings?.colors?.bad ?? CHART_COLORS.danger;

    const [tWarn, tGood] = thresholds;

    if (betterWhen === 'higher') {
      if (p < tWarn) return bad;
      if (p < tGood) return warn;
      return good;
    }

    // lower is better (existing behavior)
    if (p < tWarn) return good;
    if (p < tGood) return warn;
    return bad;
  };

  return (
    <div className={styles.panelContainer} data-panel-id={id}>
      <PanelHeader
        title={title}
        badge="GAUGE"
        onDelete={onDelete}
        onEdit={onEdit}
      />

      <div className={styles.content}>
        <div className={styles.gaugeWrapper}>
          <svg className={styles.svg} viewBox="0 0 160 100">
            {/* 背景弧線 */}
            <path
              className={styles.bgPath}
              d="M 10 90 A 70 70 0 0 1 150 90"
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* 進度弧線 */}
            <path
              className={styles.progressPath}
              d="M 10 90 A 70 70 0 0 1 150 90"
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              style={{
                strokeDashoffset: offset,
                stroke: getColor(percent)
              }}
            />
          </svg>
          <div className={styles.valueDisplay}>
            <span className={styles.mainValue} style={{ color: getColor(percent) }}>
              {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span className={styles.unit}>{unit}</span>
          </div>
        </div>
        <div className={styles.footer}>
          <span className={styles.statusLabel}>{metricName || t('telemetry.engineStatus')}</span>
        </div>
      </div>
    </div>
  );
};
