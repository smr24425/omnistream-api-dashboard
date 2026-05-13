import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import type { ResponsiveLayouts } from 'react-grid-layout/legacy';
import { LineChartPanel } from '../../components/charts/LineChartPanel/LineChartPanel';
import { TopologyPanel } from '../../components/charts/TopologyPanel/TopologyPanel';
import { StatPanel } from '../../components/charts/StatPanel/StatPanel';
import { SparklinePanel } from '../../components/charts/SparklinePanel/SparklinePanel';
import { BarChartPanel } from '../../components/charts/BarChartPanel/BarChartPanel';
import { GaugePanel } from '../../components/charts/GaugePanel/GaugePanel';
import { DonutPanel } from '../../components/charts/DonutPanel/DonutPanel';
import type { DashboardView } from '../../types/dashboard';
import styles from './Dashboard.module.scss';

const ResponsiveGridLayout = WidthProvider(Responsive);

import { CreateButton } from '../../components/ui/CreateButton/CreateButton';
import ScrollableTabs from '../../components/ui/ScrollableTabs/ScrollableTabs';

interface DashboardProps {
  dashboards: DashboardView[];
  activeDashboardId: string;
  activeDashboard: DashboardView;
  queries: any[];
  onSchemaChange: (layouts: ResponsiveLayouts) => void;
  onDeletePanel: (id: string) => void;
  onEditPanel: (id: string) => void;
  onAddPanel: () => void;
  onAddDashboard: () => void;
  onSwitchDashboard: (id: string) => void;
  onDeleteDashboard: (id: string) => void;
}

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

const PANEL_COMPONENTS: Record<string, React.FC<any>> = {
  'LINE': LineChartPanel,
  'STAT': StatPanel,
  'SPARKLINE': SparklinePanel,
  'BAR': BarChartPanel,
  'GAUGE': GaugePanel,
  'DONUT': DonutPanel,
  'TOPOLOGY': TopologyPanel,
  'CANVAS': TopologyPanel,
};

export const Dashboard: React.FC<DashboardProps> = ({
  dashboards,
  activeDashboardId,
  activeDashboard,
  queries,
  onSchemaChange,
  onDeletePanel,
  onEditPanel,
  onAddPanel,
  onAddDashboard,
  onSwitchDashboard,
  onDeleteDashboard
}) => {
  const { t } = useTranslation();
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('lg');
  const lastAllLayoutsRef = React.useRef<any>(activeDashboard.layouts);
  // const [isStressTest, setIsStressTest] = useState(false);
  // const toggleStressTest = () => {
  //   const newState = !isStressTest;
  //   setIsStressTest(newState);
  //   dataManager.toggleStressTest(newState);
  // };


  // 當外部 activeDashboard 變更時（例如新增/刪除面板），同步更新內部緩存
  React.useEffect(() => {
    lastAllLayoutsRef.current = activeDashboard.layouts;
  }, [activeDashboard.layouts]);

  const syncAllLayouts = (currentLayout: any[], allLayouts: any) => {
    const sortedItems = [...currentLayout].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    const nextLayouts = { ...allLayouts };

    // 關鍵修復：顯式更新當前斷點的佈局，確保儲存的是最終座標
    nextLayouts[currentBreakpoint] = currentLayout;

    Object.keys(COLS).forEach(bp => {
      if (bp === currentBreakpoint) return;

      const bpCols = (COLS as any)[bp];
      const bpLayout = nextLayouts[bp] || [];

      let currentX = 0;
      let currentY = 0;
      let maxHInRow = 0;

      const syncedBpLayout = sortedItems.map(item => {
        const existing = bpLayout.find((l: any) => l.i === item.i) || item;
        const w = Math.min(existing.w, bpCols);
        const h = existing.h;

        if (currentX + w > bpCols) {
          currentX = 0;
          currentY += maxHInRow;
          maxHInRow = 0;
        }

        const newItem = { ...existing, x: currentX, y: currentY, w, h };
        currentX += w;
        maxHInRow = Math.max(maxHInRow, h);

        return newItem;
      });

      nextLayouts[bp] = syncedBpLayout;
    });

    return nextLayouts;
  };

  const handleLayoutChange = (_: any, allLayouts: any) => {
    // 即時緩存最新的佈局數據，但不觸發全域狀態更新（避免縮放時的死循環）
    lastAllLayoutsRef.current = allLayouts;
  };

  const handleInteractionStop = (layout: any) => {
    // 只有在手動操作結束時，才執行跨斷點同步並持久化
    const syncedLayouts = syncAllLayouts(layout, lastAllLayoutsRef.current);
    onSchemaChange(syncedLayouts);
  };

  const handleBreakpointChange = (newBreakpoint: string) => {
    setCurrentBreakpoint(newBreakpoint);
  };

  return (
    <div className={styles.dashboardContainer}>
      <ScrollableTabs
        dashboards={dashboards}
        activeDashboardId={activeDashboardId}
        onSwitchDashboard={onSwitchDashboard}
        onDeleteDashboard={onDeleteDashboard}
        onAddDashboard={onAddDashboard}
      />

      <div className={styles.controls}>
        <div className={styles.left}>
          <div className={styles.info}>{t('dashboard.currentBp')}: {currentBreakpoint.toUpperCase()}</div>
        </div>
        <div className={styles.right}>
          {/* <button
            onClick={toggleStressTest}
            className={`${styles.stressBtn} ${isStressTest ? styles.active : ''}`}
          >
            <FiZap /> {isStressTest ? t('dashboard.stopStress') : t('dashboard.runStress')}
          </button> */}
          <CreateButton onClick={onAddPanel}>
            {t('dashboard.addPanel')}
          </CreateButton>
        </div>
      </div>
      <div className={styles.gridWrapper}>
        <ResponsiveGridLayout
          className="layout"
          layouts={activeDashboard.layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={100}
          margin={[20, 20]}
          containerPadding={[20, 20]}
          draggableHandle={`.${styles.dragHandle}`}
          onLayoutChange={handleLayoutChange}
          onDragStop={handleInteractionStop}
          onResizeStop={handleInteractionStop}
          onBreakpointChange={handleBreakpointChange}
          compactType="vertical"
          useCSSTransforms={true}
        >
          {activeDashboard.panels.map((panel) => {
            const query = Array.isArray(panel.queryId)
              ? queries.find((q: any) => q.id === panel.queryId[0])
              : queries.find((q: any) => q.id === panel.queryId);

            const metricName = query?.name;
            const unit = query?.unit;

            const PanelComponent = PANEL_COMPONENTS[panel.type] || TopologyPanel;

            return (
              <div key={panel.id} className={styles.gridItem}>
                <div className={styles.dragHandle}>:::</div>
                <PanelComponent
                  id={panel.id}
                  title={panel.title}
                  metricName={metricName}
                  unit={unit}
                  settings={panel.settings}
                  onDelete={() => onDeletePanel(panel.id)}
                  onEdit={() => onEditPanel(panel.id)}
                />
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};
