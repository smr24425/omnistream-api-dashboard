import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { renderLoop } from '../../../engine/RenderLoop';
import { dataManager } from '../../../engine/DataManager';
import styles from './TelemetryOverlay.module.scss';

export const TelemetryOverlay: React.FC = () => {
  const { t } = useTranslation();
  const [fps, setFps] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const lastUpdateRef = useRef(0);
  const frameTimesRef = useRef<number[]>([]);

  useEffect(() => {
    lastUpdateRef.current = performance.now();
    
    const updateStats = (deltaTime: number, timestamp: number) => {
      frameTimesRef.current.push(deltaTime);
      if (frameTimesRef.current.length > 60) frameTimesRef.current.shift();

      // 每秒鐘執行一次統計更新
      if (timestamp - lastUpdateRef.current >= 1000) {
        const avgDelta = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        const newFps = avgDelta > 0 ? Math.round(1000 / avgDelta) : 0;
        
        // 點數統計：從數據管理器獲取真實數據點總數
        const allData = dataManager.getAllHistory();
        let pointsCount = 0;
        allData.forEach(panelMap => {
          panelMap.forEach(points => {
            pointsCount += points.length;
          });
        });

        // 使用非同步更新，避免與 Resize 等同步渲染衝突
        requestAnimationFrame(() => {
          setFps(newFps);
          setTotalPoints(pointsCount);
        });

        lastUpdateRef.current = timestamp;
      }
    };

    const unregister = renderLoop.register(updateStats);
    return () => { unregister(); };
  }, []);

  return (
    <div className={styles.telemetryOverlay}>
      <div className={styles.statItem}>
        <span className={styles.label}>{t('telemetry.fps')}</span>
        <span className={styles.value} style={{ color: fps > 50 ? '#10b981' : '#f59e0b' }}>
          {fps}
        </span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.label}>{t('telemetry.points')}</span>
        <span className={styles.value}>{totalPoints.toLocaleString()}</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.label}>ENGINE</span>
        <span className={styles.value}>CANVAS V3.0</span>
      </div>
    </div>
  );
};
