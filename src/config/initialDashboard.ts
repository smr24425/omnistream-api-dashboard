import type { AppSchema } from '../types/dashboard';

// ── Panel 標題雙語對照表 ──────────────────────────────────────────
// key = panel id，與下方 INITIAL_SCHEMA.dashboards[0].panels[].id 對應
const PANEL_TITLE_MAP: Record<string, Record<'en' | 'zh', string>> = {
  p1: { en: 'Request Throughput', zh: '請求吞吐量' },
  p2: { en: 'Online Users', zh: '線上用戶數' },
  p4: { en: 'Service Health', zh: '服務健康度' },
  p3: { en: 'P95 Latency', zh: 'P95 延遲' },
  p5: { en: 'Error Rate', zh: '錯誤率' },
  p6: { en: 'Traffic by Region', zh: '地區流量占比' },
};

// 主體 schema（英文版）——作為基準模板
export const INITIAL_SCHEMA: AppSchema = {
  activeDashboardId: 'd1',
  dashboards: [
    {
      id: 'd1',
      name: 'Platform Overview',
      panels: [
        // LINE — 多服務 req/s 趨勢（展示多線時序）
        {
          id: 'p1',
          title: 'Request Throughput',
          type: 'LINE',
          queryId: ['q_checkout_rps', 'q_search_rps', 'q_auth_rps'],
        },
        // STAT — 當前線上用戶數（大數字一目瞭然）
        {
          id: 'p2',
          title: 'Online Users',
          type: 'STAT',
          queryId: 'q_users',
          settings: { precision: 0 },
        },
        // GAUGE — 服務健康分數 0-100（顏色警示感）
        {
          id: 'p4',
          title: 'Service Health',
          type: 'GAUGE',
          queryId: 'q_health',
          settings: { min: 0, max: 100, betterWhen: 'higher' },
        },
        // BAR — 各服務 P95 延遲對比（越長代表越慢）
        {
          id: 'p3',
          title: 'P95 Latency',
          type: 'BAR',
          queryId: ['q_lat_checkout', 'q_lat_search', 'q_lat_auth'],
        },
        // SPARKLINE — 全站錯誤率趨勢（細微波動感）
        {
          id: 'p5',
          title: 'Error Rate',
          type: 'SPARKLINE',
          queryId: 'q_errors',
          settings: { precision: 2 },
        },
        // DONUT — 地區流量佔比（環狀比例一目瞭然）
        {
          id: 'p6',
          title: 'Traffic by Region',
          type: 'DONUT',
          queryId: ['q_traffic_apac', 'q_traffic_na', 'q_traffic_eu', 'q_traffic_others'],
          settings: { precision: 0 },
        },
      ],
      layouts: {
        lg: [
          // 上排：LINE 佔主區，STAT + GAUGE 堆疊在右側
          { i: 'p1', x: 0, y: 0, w: 8, h: 4, minW: 3, minH: 2 },
          { i: 'p2', x: 8, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
          { i: 'p4', x: 10, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
          // 下排：BAR + SPARKLINE + DONUT
          { i: 'p3', x: 0, y: 4, w: 4, h: 4, minW: 2, minH: 2 },
          { i: 'p5', x: 4, y: 4, w: 4, h: 4, minW: 2, minH: 2 },
          { i: 'p6', x: 8, y: 4, w: 4, h: 4, minW: 2, minH: 2 },
        ],
        md: [
          { i: 'p1', x: 0, y: 0, w: 7, h: 4 },
          { i: 'p2', x: 7, y: 0, w: 2, h: 2 },
          { i: 'p4', x: 7, y: 2, w: 2, h: 2 },
          { i: 'p3', x: 0, y: 4, w: 4, h: 4 },
          { i: 'p5', x: 4, y: 4, w: 3, h: 4 },
          { i: 'p6', x: 7, y: 4, w: 3, h: 4 },
        ],
        sm: [
          { i: 'p1', x: 0, y: 0, w: 6, h: 3 },
          { i: 'p2', x: 0, y: 3, w: 3, h: 2 },
          { i: 'p4', x: 3, y: 3, w: 3, h: 2 },
          { i: 'p3', x: 0, y: 5, w: 6, h: 4 },
          { i: 'p5', x: 0, y: 9, w: 4, h: 3 },
          { i: 'p6', x: 4, y: 9, w: 2, h: 3 },
        ],
      },
    },
  ],
  dataSources: [
    {
      id: 'mock_saas',
      name: 'SaaS Platform Metrics',
      url: '',           // 空 URL = 使用內建 mock 引擎
      interval: 800,
      headers: {},
    },
  ],
  queries: [
    // ── LINE：請求吞吐量（各服務 req/s）──────────────────
    { id: 'q_checkout_rps', name: 'Checkout', dataSourceId: 'mock_saas', yPath: 'services.[name=checkout].rps', unit: 'req/s' },
    { id: 'q_search_rps', name: 'Search', dataSourceId: 'mock_saas', yPath: 'services.[name=search].rps', unit: 'req/s' },
    { id: 'q_auth_rps', name: 'Auth', dataSourceId: 'mock_saas', yPath: 'services.[name=auth].rps', unit: 'req/s' },

    // ── STAT：線上用戶數 ─────────────────────────────────
    { id: 'q_users', name: 'Online Users', dataSourceId: 'mock_saas', yPath: 'platform.online_users', unit: '' },

    // ── GAUGE：服務健康分數 ──────────────────────────────
    { id: 'q_health', name: 'Health Score', dataSourceId: 'mock_saas', yPath: 'platform.health_score', unit: '%' },

    // ── SPARKLINE：全站錯誤率 ────────────────────────────
    { id: 'q_errors', name: 'Error Rate', dataSourceId: 'mock_saas', yPath: 'platform.error_rate', unit: '%' },

    // ── BAR：各服務 P95 延遲 ─────────────────────────────
    { id: 'q_lat_checkout', name: 'Checkout', dataSourceId: 'mock_saas', yPath: 'services.[name=checkout].latency_p95', unit: 'ms' },
    { id: 'q_lat_search', name: 'Search', dataSourceId: 'mock_saas', yPath: 'services.[name=search].latency_p95', unit: 'ms' },
    { id: 'q_lat_auth', name: 'Auth', dataSourceId: 'mock_saas', yPath: 'services.[name=auth].latency_p95', unit: 'ms' },

    // ── DONUT：地區流量分佈 ──────────────────────────────
    { id: 'q_traffic_apac', name: 'Asia Pacific', dataSourceId: 'mock_saas', yPath: 'traffic.[region=APAC].requests', unit: '' },
    { id: 'q_traffic_na', name: 'North America', dataSourceId: 'mock_saas', yPath: 'traffic.[region=NA].requests', unit: '' },
    { id: 'q_traffic_eu', name: 'Europe', dataSourceId: 'mock_saas', yPath: 'traffic.[region=EU].requests', unit: '' },
    { id: 'q_traffic_others', name: 'Others', dataSourceId: 'mock_saas', yPath: 'traffic.[region=Others].requests', unit: '' },
  ],
  settings: {
    proxyUrl: '',
    isPaused: false,
    language: 'en',
  },
};

// ── Query 名稱雙語對照表 ──────────────────────────────────────────
// 服務技術名稱 (Checkout/Search/Auth) 不翻譯，只翻譯使用者可見的 UI 標籤
const QUERY_NAME_MAP: Record<string, Record<'en' | 'zh', string>> = {
  // 通用指標
  q_users: { en: 'Online Users', zh: '線上用戶數' },
  q_health: { en: 'Health Score', zh: '健康分數' },
  q_errors: { en: 'Error Rate', zh: '錯誤率' },
  // 地區流量（DONUT legend 最醒目，最適合在地化）
  q_traffic_apac: { en: 'Asia Pacific', zh: '亞太地區' },
  q_traffic_na: { en: 'North America', zh: '北美洲' },
  q_traffic_eu: { en: 'Europe', zh: '歐洲' },
  q_traffic_others: { en: 'Others', zh: '其他地區' },
};

// ── DataSource 名稱雙語對照表 ────────────────────────────────────
const DATASOURCE_NAME_MAP: Record<string, Record<'en' | 'zh', string>> = {
  mock_saas: { en: 'SaaS Platform Metrics', zh: 'SaaS 平台指標' },
};

// ── 依語言取得初始 Schema ──────────────────────────────────────────
// 首次載入時呼叫，根據瀏覽器/用戶語言設定自動套用對應標題
export function getInitialSchema(lang: 'en' | 'zh'): AppSchema {
  const l = lang === 'zh' ? 'zh' : 'en';

  return {
    ...INITIAL_SCHEMA,
    settings: {
      ...INITIAL_SCHEMA.settings,
      language: l,
    },
    dataSources: INITIAL_SCHEMA.dataSources.map(ds => ({
      ...ds,
      name: DATASOURCE_NAME_MAP[ds.id]?.[l] ?? ds.name,
    })),
    queries: INITIAL_SCHEMA.queries.map(q => ({
      ...q,
      name: QUERY_NAME_MAP[q.id]?.[l] ?? q.name,
    })),
    dashboards: INITIAL_SCHEMA.dashboards.map((dashboard, idx) => ({
      ...dashboard,
      name: idx === 0
        ? (l === 'zh' ? '平台總覽' : 'Platform Overview')
        : dashboard.name,
      panels: dashboard.panels.map(panel => ({
        ...panel,
        title: PANEL_TITLE_MAP[panel.id]?.[l] ?? panel.title,
      })),
    })),
  };
}
