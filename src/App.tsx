import { useState, useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Layouts
import { Sidebar } from './layouts/Sidebar/Sidebar';
import { TopNav } from './layouts/TopNav/TopNav';

// Pages
import { Dashboard } from './pages/Dashboard/Dashboard';
import { DataView } from './pages/DataHub/DataView';
import { SettingsView } from './pages/Settings/SettingsView';

// Components
import { AddDashboardModal } from './components/modals/AddDashboardModal/AddDashboardModal';
import { AddPanelModal } from './components/modals/AddPanelModal/AddPanelModal';
import { AddDataSourceModal } from './components/modals/AddDataSourceModal/AddDataSourceModal';
import { AddQueryModal } from './components/modals/AddQueryModal/AddQueryModal';
import { ConfirmModal } from './components/modals/ConfirmModal/ConfirmModal';

import { dataManager } from './engine/DataManager';
import { renderLoop } from './engine/RenderLoop';
import styles from './App.module.scss';

import { INITIAL_SCHEMA, getInitialSchema } from './config/initialDashboard';
import type { AppSchema, DashboardView, DataSource, Query, PanelConfig } from './types/dashboard';

const STORAGE_KEY = 'omnistream-v1';

function App() {
  const [schema, setSchema] = useState<AppSchema>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 無痛遷移：偵測到舊版（有 panels 但無 dashboards 陣列）
        if (!parsed.dashboards && parsed.panels && parsed.layouts) {
          return {
            activeDashboardId: 'd1',
            dashboards: [{
              id: 'd1',
              name: 'Default Dashboard',
              panels: parsed.panels,
              layouts: parsed.layouts
            }],
            dataSources: parsed.dataSources || [],
            queries: parsed.queries || [],
            settings: parsed.settings || INITIAL_SCHEMA.settings
          };
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse schema', e);
        return INITIAL_SCHEMA;
      }
    }
    // 無 localStorage 資料時：偵測瀏覽器語言，使用對應標題的初始 Schema
    const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
    return getInitialSchema(browserLang);
  });

  const [modalState, setModalState] = useState<{
    panel: boolean;
    dashboard: boolean;
    source: DataSource | boolean;
    query: Query | boolean;
  }>({ panel: false, dashboard: false, source: false, query: false });

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const { t, i18n } = useTranslation();

  // 取得當前的 DashboardView
  const activeDashboard = schema.dashboards.find(d => d.id === schema.activeDashboardId) || schema.dashboards[0];

  useEffect(() => {
    if (schema.settings.language !== i18n.language) {
      i18n.changeLanguage(schema.settings.language);
    }
  }, [schema.settings.language, i18n]);

  const updateSchema = useCallback((newSchema: AppSchema) => {
    setSchema(_prev => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSchema));
      return newSchema;
    });
  }, []);

  const updateLanguage = useCallback((language: 'en' | 'zh') => {
    updateSchema({ ...schema, settings: { ...schema.settings, language } });
  }, [schema, updateSchema]);

  const handleLayoutChange = useCallback((layouts: any) => {
    setSchema(_prev => {
      const newDashboards = _prev.dashboards.map(d =>
        d.id === _prev.activeDashboardId ? { ...d, layouts } : d
      );
      const next = { ..._prev, dashboards: newDashboards };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    renderLoop.start();
    return () => renderLoop.stop();
  }, []);

  // Worker 同步：只同步當前 Dashboard 的 panels
  useEffect(() => {
    dataManager.syncConfig(
      schema.dataSources,
      schema.queries,
      activeDashboard.panels,
      schema.settings.proxyUrl,
      schema.settings.isPaused
    );
  }, [schema.dataSources, schema.queries, activeDashboard.panels, schema.settings]);

  const handleAddPanel = useCallback((config: any) => {
    setSchema(_prev => {
      const id = `p_${Date.now()}`;
      const newPanel: PanelConfig = {
        id,
        title: config.title,
        type: config.type,
        queryId: config.queryId,
        settings: config.settings
      };

      const newDashboards = _prev.dashboards.map(d => {
        if (d.id === _prev.activeDashboardId) {
          const newLayouts = { ...d.layouts };
          Object.keys(newLayouts).forEach(bp => {
            newLayouts[bp] = [{ i: id, x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 2 }, ...(newLayouts[bp] || [])];
          });
          return { ...d, panels: [...d.panels, newPanel], layouts: newLayouts };
        }
        return d;
      });

      const next = { ..._prev, dashboards: newDashboards };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Panel 編輯 ───────────────────────────────────────────────────
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);

  const editingPanel = editingPanelId
    ? activeDashboard.panels.find(p => p.id === editingPanelId) ?? null
    : null;

  const handleEditPanel = useCallback((id: string) => {
    setEditingPanelId(id);
    setModalState(s => ({ ...s, panel: true }));
  }, []);

  const handleUpdatePanel = useCallback((config: any) => {
    if (!editingPanelId) return;
    const targetId = editingPanelId; // 避免 closure 過期問題
    // 立刻清除舊快取：避免換 metric 後仍顯示舊圖形
    dataManager.clearData(targetId);
    setSchema(_prev => {
      const newDashboards = _prev.dashboards.map(d => ({
        ...d,
        panels: d.panels.map(p =>
          p.id === targetId
            ? { ...p, title: config.title, queryId: config.queryId, settings: config.settings }
            : p
        )
      }));
      const next = { ..._prev, dashboards: newDashboards };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setEditingPanelId(null);
  }, [editingPanelId]);

  const handleUpsertSource = useCallback((source: DataSource) => {
    const exists = schema.dataSources.some(s => s.id === source.id);
    if (exists) {
      updateSchema({ ...schema, dataSources: schema.dataSources.map(s => s.id === source.id ? source : s) });
    } else {
      updateSchema({ ...schema, dataSources: [...schema.dataSources, source] });
    }
  }, [schema, updateSchema]);

  const handleUpsertQuery = useCallback((query: Query) => {
    const exists = schema.queries.some(q => q.id === query.id);
    if (exists) {
      updateSchema({ ...schema, queries: schema.queries.map(q => q.id === query.id ? query : q) });
    } else {
      updateSchema({ ...schema, queries: [...schema.queries, query] });
    }
  }, [schema, updateSchema]);

  const handleDeletePanel = useCallback((id: string) => {
    setConfirmState({
      isOpen: true,
      title: t('modals.confirm.deleteTitle'),
      message: t('modals.confirm.deleteMsg'),
      onConfirm: () => {
        setSchema(_prev => {
          const newDashboards = _prev.dashboards.map(d => {
            if (d.id === _prev.activeDashboardId) {
              const newPanels = d.panels.filter(p => p.id !== id);
              const newLayouts = { ...d.layouts };
              Object.keys(newLayouts).forEach(bp => {
                if (newLayouts[bp]) {
                  newLayouts[bp] = (newLayouts[bp] as any[]).filter((l: any) => l.i !== id);
                }
              });
              return { ...d, panels: newPanels, layouts: newLayouts };
            }
            return d;
          });
          const next = { ..._prev, dashboards: newDashboards };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      }
    });
  }, [t]);

  const handleAddDashboard = useCallback((name: string) => {
    setSchema(_prev => {
      const id = `d_${Date.now()}`;
      const newDashboard: DashboardView = { id, name, panels: [], layouts: {} };
      const next = {
        ..._prev,
        dashboards: [..._prev.dashboards, newDashboard],
        activeDashboardId: id
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleSwitchDashboard = useCallback((id: string) => {
    setSchema(_prev => {
      const next = { ..._prev, activeDashboardId: id };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleDeleteDashboard = useCallback((id: string) => {
    setConfirmState({
      isOpen: true,
      title: t('modals.confirm.deleteTitle'),
      message: t('modals.confirm.deleteMsg'),
      onConfirm: () => {
        setSchema(_prev => {
          if (_prev.dashboards.length <= 1) return _prev; // 防止刪除最後一個
          const newDashboards = _prev.dashboards.filter(d => d.id !== id);
          const nextActiveId = _prev.activeDashboardId === id ? newDashboards[0].id : _prev.activeDashboardId;
          const next = { ..._prev, dashboards: newDashboards, activeDashboardId: nextActiveId };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      }
    });
  }, [t]);

  const handleDeleteSource = useCallback((id: string) => {
    setConfirmState({
      isOpen: true,
      title: t('modals.confirm.deleteTitle'),
      message: t('modals.confirm.deleteMsg'),
      onConfirm: () => {
        updateSchema({
          ...schema,
          dataSources: schema.dataSources.filter(s => s.id !== id),
          queries: schema.queries.filter(q => q.dataSourceId !== id)
        });
      }
    });
  }, [schema, updateSchema, t]);

  const handleDeleteQuery = useCallback((id: string) => {
    setConfirmState({
      isOpen: true,
      title: t('modals.confirm.deleteTitle'),
      message: t('modals.confirm.deleteMsg'),
      onConfirm: () => {
        updateSchema({ ...schema, queries: schema.queries.filter(q => q.id !== id) });
      }
    });
  }, [schema, updateSchema, t]);

  const togglePause = useCallback(() => {
    updateSchema({ ...schema, settings: { ...schema.settings, isPaused: !schema.settings.isPaused } });
  }, [schema, updateSchema]);

  return (
    <div className={styles.appContainer}>
      <Sidebar />
      <div className={styles.contentWrapper}>
        <TopNav
          onSave={() => alert(t('topNav.saved'))}
          isPaused={schema.settings.isPaused}
          onTogglePause={togglePause}
          onUpdateLanguage={updateLanguage}
        />

        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={
              <>
                <Dashboard
                  dashboards={schema.dashboards}
                  activeDashboardId={schema.activeDashboardId}
                  activeDashboard={activeDashboard}
                  queries={schema.queries}
                  onSchemaChange={handleLayoutChange}
                  onDeletePanel={handleDeletePanel}
                  onEditPanel={handleEditPanel}
                  onAddPanel={() => {
                    setEditingPanelId(null);
                    setModalState(s => ({ ...s, panel: true }));
                  }}
                  onAddDashboard={() => setModalState(s => ({ ...s, dashboard: true }))}
                  onSwitchDashboard={handleSwitchDashboard}
                  onDeleteDashboard={handleDeleteDashboard}
                />
              </>
            } />
            <Route path="/data-hub" element={
              <DataView
                dataSources={schema.dataSources}
                queries={schema.queries}
                onAddSource={() => setModalState(s => ({ ...s, source: true }))}
                onAddQuery={() => setModalState(s => ({ ...s, query: true }))}
                onEditSource={(source) => setModalState(s => ({ ...s, source }))}
                onEditQuery={(query) => setModalState(s => ({ ...s, query }))}
                onDeleteSource={handleDeleteSource}
                onDeleteQuery={handleDeleteQuery}
              />
            } />
            <Route path="/settings" element={
              <SettingsView
                proxyUrl={schema.settings.proxyUrl}
                onUpdateProxy={(proxyUrl) => updateSchema({ ...schema, settings: { ...schema.settings, proxyUrl } })}
                onUpdateLanguage={updateLanguage}
              />
            } />
          </Routes>
        </main>
      </div>

      <AddPanelModal
        isOpen={modalState.panel}
        queries={schema.queries}
        onClose={() => {
          setModalState(s => ({ ...s, panel: false }));
          setEditingPanelId(null);
        }}
        onConfirm={editingPanel ? handleUpdatePanel : handleAddPanel}
        initialConfig={editingPanel
          ? { title: editingPanel.title, type: editingPanel.type, queryId: editingPanel.queryId, settings: editingPanel.settings }
          : undefined
        }
      />

      <AddDashboardModal
        isOpen={modalState.dashboard}
        onClose={() => setModalState(s => ({ ...s, dashboard: false }))}
        onConfirm={handleAddDashboard}
      />

      <AddDataSourceModal
        isOpen={!!modalState.source}
        initialData={typeof modalState.source === 'object' ? modalState.source : undefined}
        onClose={() => setModalState(s => ({ ...s, source: false }))}
        onConfirm={handleUpsertSource}
      />

      <AddQueryModal
        isOpen={!!modalState.query}
        initialData={typeof modalState.query === 'object' ? modalState.query : undefined}
        dataSources={schema.dataSources}
        onClose={() => setModalState(s => ({ ...s, query: false }))}
        onConfirm={handleUpsertQuery}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onClose={() => setConfirmState(s => ({ ...s, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
      />
    </div>
  );
}

export default App;
