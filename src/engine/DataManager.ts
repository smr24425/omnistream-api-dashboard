/**
 * DataManager.ts (V5.1 - Batch Enabled)
 */

export type DataPoint = { x: number; y: number; metricName?: string; unit?: string };
export type DataListener = (points: DataPoint[]) => void;

class DataManager {
  private worker: Worker;
  private listeners: Map<string, Set<DataListener>> = new Map();
  private dataHistory: Map<string, Map<string, DataPoint[]>> = new Map();
  private errors: Map<string, string> = new Map();
  private MAX_HISTORY = 5000;

  constructor() {
    this.worker = new Worker(new URL('./dataWorker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'DATA_UPDATE') {
        const pointWithMetric = { 
          ...payload.point, 
          metricName: payload.metricName || 'Value', 
          unit: payload.unit 
        };
        // 清除錯誤狀態，因為我們收到了新數據
        this.errors.delete(payload.id);
        this.handleDataBatch(payload.id, [pointWithMetric]);
      } else if (type === 'DATA_ERROR') {
        this.errors.set(payload.id, payload.error);
        const callbacks = this.listeners.get(payload.id);
        if (callbacks) {
          callbacks.forEach(cb => cb([])); // 觸發更新，傳入空數組
        }
      } else if (type === 'DATA_BATCH') {
        this.errors.delete(payload.id);
        this.handleDataBatch(payload.id, payload.points);
      }
    };
  }

  public getPanelError(id: string): string | undefined {
    return this.errors.get(id);
  }

  public syncConfig(dataSources: any[], queries: any[], panels: any[], proxyUrl: string, isPaused: boolean) {
    this.worker.postMessage({
      type: 'SYNC_CONFIG',
      payload: { dataSources, queries, panels, proxyUrl, isPaused }
    });
  }

  public toggleStressTest(enabled: boolean) {
    this.worker.postMessage({ type: 'TOGGLE_STRESS_TEST', payload: enabled });
  }

  private handleDataBatch(id: string, points: DataPoint[]) {
    if (!this.dataHistory.has(id)) {
      this.dataHistory.set(id, new Map());
    }
    const panelData = this.dataHistory.get(id)!;

    points.forEach(p => {
      const metricName = p.metricName || 'Value';
      if (!panelData.has(metricName)) {
        panelData.set(metricName, []);
      }
      const history = panelData.get(metricName)!;
      history.push(p);

      // 嚴格限制每個指標的歷史長度
      if (history.length > this.MAX_HISTORY) {
        // 使用高效的原地清理（如果點數過多）
        panelData.set(metricName, history.slice(-this.MAX_HISTORY));
      }
    });

    const callbacks = this.listeners.get(id);
    if (callbacks) {
      callbacks.forEach(cb => cb(points));
    }
  }

  public subscribe(id: string, callback: DataListener) {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set());
    }
    this.listeners.get(id)!.add(callback);

    // 這裡我們不立即回傳全量數據，因為面板現在會直接調用 getPanelData
    return () => {
      this.listeners.get(id)?.delete(callback);
    };
  }

  public getPanelData(id: string): Map<string, DataPoint[]> | undefined {
    return this.dataHistory.get(id);
  }

  public getAllHistory(): Map<string, Map<string, DataPoint[]>> {
    return this.dataHistory;
  }

  public clearData(id: string) {
    this.dataHistory.delete(id);
  }
}

export const dataManager = new DataManager();
