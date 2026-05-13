import React from 'react';
import styles from './ChartTooltip.module.scss';

export interface TooltipItem {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

interface ChartTooltipProps {
  visible: boolean;
  x: number;
  items?: TooltipItem[];
  label?: string;
  value?: string | number;
  unit?: string;
  time: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ 
  visible, x, items, label, value, unit, time 
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState(0);

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const parentRect = containerRef.current.parentElement?.getBoundingClientRect();
      if (parentRect) {
        // 檢查右邊界溢出
        const rightEdge = x + rect.width / 2;
        if (rightEdge > parentRect.width) {
          setOffset(parentRect.width - rightEdge - 10);
        } else if (x - rect.width / 2 < 0) {
          // 檢查左邊界溢出
          setOffset(rect.width / 2 - x + 10);
        } else {
          setOffset(0);
        }
      }
    }
  }, [x, visible, items]); // items 變化也需要重算位置

  if (!visible) return null;

  return (
    <div 
      ref={containerRef}
      className={styles.tooltipContainer} 
      style={{ 
        left: x, 
        top: 10, 
        transform: `translate(calc(-50% + ${offset}px), 0)` 
      }}
    >
      <div className={styles.content}>
        {items ? (
          items.map((item, idx) => (
            <div key={idx} className={styles.row}>
              <div className={styles.indicatorGroup}>
                {item.color && (
                  <span 
                    className={styles.colorIndicator} 
                    style={{ backgroundColor: item.color }} 
                  />
                )}
                <span className={styles.label}>{item.label}:</span>
              </div>
              <span className={styles.value}>{item.value}{item.unit}</span>
            </div>
          ))
        ) : (
          <div className={styles.row}>
            <span className={styles.label}>{label}:</span>
            <span className={styles.value}>{value}{unit}</span>
          </div>
        )}
      </div>
      <div className={styles.time}>{time}</div>
      <div className={styles.arrow} />
    </div>
  );
};
