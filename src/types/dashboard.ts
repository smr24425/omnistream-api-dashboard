import type { ResponsiveLayouts } from 'react-grid-layout/legacy';

export type PanelType = 'LINE' | 'STAT' | 'TOPOLOGY' | 'SPARKLINE' | 'BAR' | 'GAUGE' | 'DONUT' | 'CANVAS';

export interface DataSource {
  id: string;
  name: string;
  url: string;
  interval: number;
  headers: Record<string, string>;
}

export interface Query {
  id: string;
  name: string;
  dataSourceId: string;
  yPath: string;
  tPath?: string;
  unit?: string;
}

export interface PanelConfig {
  id: string;
  title: string;
  type: PanelType;
  queryId: string | string[];
  settings?: Record<string, any>;
}

export interface DashboardView {
  id: string;
  name: string;
  layouts: ResponsiveLayouts;
  panels: PanelConfig[];
}

export interface AppSchema {
  dashboards: DashboardView[];
  activeDashboardId: string;
  dataSources: DataSource[];
  queries: Query[];
  settings: {
    proxyUrl: string;
    isPaused: boolean;
    language: 'en' | 'zh';
  };
}
