import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './ScrollableTabs.module.scss';

interface Dashboard {
  id: string;
  name: string;
}

interface ScrollableTabsProps {
  dashboards: Dashboard[];
  activeDashboardId: string;
  onSwitchDashboard: (id: string) => void;
  onDeleteDashboard: (id: string) => void;
  onAddDashboard: () => void;
}

const ScrollableTabs: React.FC<ScrollableTabsProps> = ({
  dashboards,
  activeDashboardId,
  onSwitchDashboard,
  onDeleteDashboard,
  onAddDashboard,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // 檢查捲軸位置以決定是否顯示箭頭
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // 容許 1px 誤差避免瀏覽器縮放導致計算錯誤
      setShowLeftArrow(scrollLeft > 1);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
    }
  }, []);

  // 當資料改變或視窗大小改變時，重新檢查
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [dashboards, checkScroll]);

  // 監控 Active Tab，確保切換時自動捲動到可見區域
  useEffect(() => {
    const activeTab = scrollRef.current?.querySelector(`.${styles.active}`);
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeDashboardId]);

  // 點擊箭頭捲動
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.tabsWrapper}>
      {/* 左按鈕 */}
      {showLeftArrow && (
        <button
          className={`${styles.arrowBtn} ${styles.left}`}
          onClick={() => handleScroll('left')}
          title="Scroll Left"
        >
          <FiChevronLeft />
        </button>
      )}

      <div
        className={styles.tabBar}
        ref={scrollRef}
        onScroll={checkScroll}
      >
        {dashboards.map((d) => (
          <div
            key={d.id}
            className={`${styles.tab} ${d.id === activeDashboardId ? styles.active : ''}`}
            onClick={() => onSwitchDashboard(d.id)}
          >
            <span className={styles.tabName}>{d.name}</span>
            {dashboards.length > 1 && (
              <button
                className={styles.deleteTabBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDashboard(d.id);
                }}
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        ))}
        <button
          className={styles.addTabBtn}
          onClick={onAddDashboard}
        >
          <FiPlus />
        </button>
      </div>

      {/* 右按鈕 */}
      {showRightArrow && (
        <button
          className={`${styles.arrowBtn} ${styles.right}`}
          onClick={() => handleScroll('right')}
          title="Scroll Right"
        >
          <FiChevronRight />
        </button>
      )}
    </div>
  );
};

export default ScrollableTabs;