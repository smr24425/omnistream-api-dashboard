/**
 * DataWorker.ts (V6.0 - 3-Part Architecture)
 * DataSources -> Queries -> Panels
 */

interface DataSource {
  id: string;
  url: string;
  interval: number;
  headers: Record<string, string>;
}

interface Query {
  id: string;
  name: string;
  dataSourceId: string;
  yPath: string;
  tPath?: string;
  unit?: string;
}

interface PanelSubscription {
  id: string;
  queryId: string | string[];
  settings?: Record<string, any>; // 新增設定傳遞
}

const activeDataSources = new Map<string, DataSource>();
const activeQueries = new Map<string, Query>();
const panelSubscriptions = new Map<string, PanelSubscription>();
const timers = new Map<string, any>();

const getByPath = (obj: any, path: string, collectAll: boolean = false): any => {
  if (!path) return undefined;

  // 處理 sum(...) 包裹語法
  const sumMatch = path.match(/^sum\((.+)\)$/);
  if (sumMatch) {
    const innerPath = sumMatch[1];
    const values = getByPath(obj, innerPath, true);
    if (Array.isArray(values)) {
      const flatValues = values.flat();
      return flatValues.reduce((sum, v) => sum + (typeof v === 'number' ? v : parseFloat(String(v)) || 0), 0);
    }
    return values;
  }

  const parts = path.split('.');
  let current = [obj]; // 使用陣列追蹤所有可能的分支匹配項

  for (const part of parts) {
    let next: any[] = [];
    const selectorMatch = part.match(/^\[(.+)=(.+)\]$/);

    for (const item of current) {
      if (!item) continue;

      if (selectorMatch && Array.isArray(item)) {
        const [, key, value] = selectorMatch;
        const matches = item.filter(sub => sub && String(sub[key]) === value);
        next.push(...matches);
      } else if (Array.isArray(item) && !isNaN(Number(part))) {
        const idx = Number(part);
        if (item[idx] !== undefined) next.push(item[idx]);
      } else if (Array.isArray(item)) {
        const matches = item
          .map(sub => sub && sub[part])
          .filter(v => v !== undefined);
        next.push(...matches);
      } else if (item[part] !== undefined) {
        const val = item[part];
        next.push(val);
      }
    }
    current = next;
    if (current.length === 0) return undefined;
  }

  return collectAll ? current : current[0];
};

console.log('%c[Worker] Starting DataWorker...', 'color: #4f46e5; font-weight: bold;');

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'SYNC_CONFIG':
      syncConfig(payload.dataSources, payload.queries, payload.panels, payload.proxyUrl, payload.isPaused);
      break;
    case 'SUBSCRIBE':
      panelSubscriptions.set(payload.id, { id: payload.id, queryId: payload.queryId, settings: payload.settings });
      break;
    case 'UNSUBSCRIBE':
      panelSubscriptions.delete(payload.id);
      break;
    case 'TOGGLE_STRESS_TEST':
      if (payload === true) {
        const now = Date.now();
        panelSubscriptions.forEach(sub => {
          const qIds = Array.isArray(sub.queryId) ? sub.queryId : [sub.queryId];

          // 根據面板設定決定壓力測試範圍
          const min = sub.settings?.min ?? sub.settings?.yMin ?? 0;
          const max = sub.settings?.max ?? sub.settings?.yMax ?? 100;
          const range = max - min;

          qIds.forEach(qId => {
            const query = activeQueries.get(qId);
            if (!query) return;

            const batch: any[] = [];
            for (let i = 0; i < 2000; i++) {
              batch.push({
                x: now - (2000 - i) * 100,
                y: min + Math.random() * range,
                metricName: query.name,
                unit: query.unit
              });
            }
            self.postMessage({
              type: 'DATA_BATCH',
              payload: { id: sub.id, points: batch }
            });
          });
        });
      }
      break;
  }
};

let currentProxyUrl = '';
let globalPaused = false;

function syncConfig(dataSources: DataSource[], queries: Query[], panels: any[], proxyUrl?: string, isPaused?: boolean) {
  if (proxyUrl) currentProxyUrl = proxyUrl;

  const wasPaused = globalPaused;
  if (isPaused !== undefined) globalPaused = isPaused;
  if (wasPaused && !globalPaused) {
    activeDataSources.forEach((_, id) => fetchSourceData(id));
  }

  const newDataSourceIds = new Set(dataSources.map(s => s.id));
  timers.forEach((timer, id) => {
    if (!newDataSourceIds.has(id)) {
      clearInterval(timer);
      timers.delete(id);
      activeDataSources.delete(id);
    }
  });

  dataSources.forEach(source => {
    const existing = activeDataSources.get(source.id);
    if (!existing || existing.url !== source.url || existing.interval !== source.interval) {
      if (timers.has(source.id)) clearInterval(timers.get(source.id));
      activeDataSources.set(source.id, source);
      const timer = setInterval(() => fetchSourceData(source.id), source.interval || 1000);
      timers.set(source.id, timer);
      fetchSourceData(source.id);
    }
  });

  activeQueries.clear();
  queries.forEach(q => activeQueries.set(q.id, q));

  panelSubscriptions.clear();
  panels.forEach(p => panelSubscriptions.set(p.id, p));
}

async function fetchSourceData(sourceId: string) {
  if (globalPaused) return;
  const source = activeDataSources.get(sourceId);
  if (!source) return;

  try {
    let rawData;
    if (source.url && source.url.startsWith('http')) {
      const proxyUrl = `${currentProxyUrl}?url=${encodeURIComponent(source.url)}`;
      const response = await fetch(proxyUrl, { headers: source.headers });
      if (!response.ok) return;
      rawData = await response.json();
    } else {
      // Mock 資料 — SaaS 電商平台即時監控情境
      const t = Date.now() / 1000; // 秒，用於正弦波模擬
      rawData = {
        timestamp: Date.now(),
        // 三個服務的 req/s 與 P95 延遲
        services: [
          {
            name: 'checkout',
            rps: Math.round(950  + Math.sin(t * 0.10)       * 200 + Math.random() * 80),
            latency_p95: Math.round(130 + Math.sin(t * 0.08)       * 40  + Math.random() * 20)
          },
          {
            name: 'search',
            rps: Math.round(3200 + Math.sin(t * 0.15 + 1.0) * 800 + Math.random() * 200),
            latency_p95: Math.round(45  + Math.sin(t * 0.12 + 0.5) * 15  + Math.random() * 8)
          },
          {
            name: 'auth',
            rps: Math.round(580  + Math.sin(t * 0.07 + 2.0) * 140 + Math.random() * 50),
            latency_p95: Math.round(68  + Math.sin(t * 0.09 + 1.5) * 22  + Math.random() * 12)
          }
        ],
        // 平台整體指標
        platform: {
          online_users: Math.round(6500 + Math.sin(t * 0.05)       * 1200 + Math.random() * 200),
          health_score: Math.min(100, Math.max(60,
            88 + Math.sin(t * 0.06) * 8 + (Math.random() - 0.5) * 4
          )),
          error_rate: Math.max(0.05, Math.min(5,
            1.4 + Math.sin(t * 0.11) * 1.0 + (Math.random() - 0.5) * 0.4
          ))
        },
        // 地區流量分佈
        traffic: [
          { region: 'APAC',    requests: Math.round(4100 + Math.sin(t * 0.04)       * 400 + Math.random() * 80) },
          { region: 'NA',      requests: Math.round(3100 + Math.sin(t * 0.06 + 1.0) * 300 + Math.random() * 80) },
          { region: 'EU',      requests: Math.round(2100 + Math.sin(t * 0.05 + 2.0) * 200 + Math.random() * 60) },
          { region: 'Others',  requests: Math.round(600  + Math.sin(t * 0.08 + 3.0) * 80  + Math.random() * 30) }
        ]
      };
    }

    if (!rawData) return;

    const relevantQueries = Array.from(activeQueries.values()).filter(q => q.dataSourceId === sourceId);

    relevantQueries.forEach(query => {
      const val = getByPath(rawData, query.yPath);
      const y = typeof val === 'string' ? parseFloat(val) : val;

      if (y === undefined || isNaN(y as number)) {
        // 發送錯誤消息給訂閱此指標的面板
        panelSubscriptions.forEach(sub => {
          const isMatch = Array.isArray(sub.queryId)
            ? sub.queryId.includes(query.id)
            : sub.queryId === query.id;

          if (isMatch) {
            self.postMessage({
              type: 'DATA_ERROR',
              payload: {
                id: sub.id,
                error: `Path not found: ${query.yPath}`,
                queryId: query.id
              }
            });
          }
        });
        return;
      }

      // 解析時間戳記：優先使用配置的 timeFormat
      let x = Date.now();
      if (query.tPath) {
        const extractedTime = getByPath(rawData, query.tPath);
        if (extractedTime) {
          x = typeof extractedTime === 'string' ? parseInt(extractedTime) : extractedTime;

          // 啟發式判斷 (兼容秒與毫秒)
          if (x < 10000000000) x *= 1000;
        }
      }

      panelSubscriptions.forEach(sub => {
        const isMatch = Array.isArray(sub.queryId)
          ? sub.queryId.includes(query.id)
          : sub.queryId === query.id;

        if (isMatch) {
          self.postMessage({
            type: 'DATA_UPDATE',
            payload: {
              id: sub.id,
              point: { x, y: y as number },
              metricName: query.name,
              unit: query.unit
            }
          });
        }
      });
    });

  } catch (error) {
    console.error(`Worker fetch error for source ${sourceId}:`, error);
  }
}
