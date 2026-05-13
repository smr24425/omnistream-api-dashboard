import type { DataPoint } from '../DataManager';

/**
 * LTTB (Largest-Triangle-Three-Buckets) 降採樣演算法
 * 用於在不損失視覺特徵的前提下，減少大數據量的渲染點數。
 * 
 * @param data 原始數據點陣列
 * @param threshold 目標點數 (通常與螢幕像素寬度相關)
 * @returns 降採樣後的數據點陣列
 */
export function lttb(data: DataPoint[], threshold: number): DataPoint[] {
  const size = data.length;
  if (threshold >= size || threshold <= 2) {
    return data;
  }

  const sampled: DataPoint[] = [];
  let sampledIndex = 0;

  // 每一桶的大小 (排除頭尾兩點)
  const every = (size - 2) / (threshold - 2);

  let a = 0; // 當前固定的點
  let maxAreaPoint: DataPoint = data[0];
  let maxArea: number;
  let area: number;
  let nextA: number = 0;

  sampled[sampledIndex++] = data[a]; // 第一點必選

  for (let i = 0; i < threshold - 2; i++) {
    // 1. 計算下一個桶的平均值 (作為參考點 C)
    let avgX = 0;
    let avgY = 0;
    let avgRangeStart = Math.floor((i + 1) * every) + 1;
    let avgRangeEnd = Math.floor((i + 2) * every) + 1;
    avgRangeEnd = avgRangeEnd < size ? avgRangeEnd : size;

    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
      avgX += data[avgRangeStart].x;
      avgY += data[avgRangeStart].y;
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    // 2. 在當前桶中尋找與點 A 和參考點 C 組成三角形面積最大的點 (點 B)
    let rangeOffs = Math.floor(i * every) + 1;
    const rangeTo = Math.floor((i + 1) * every) + 1;

    const pointAX = data[a].x;
    const pointAY = data[a].y;

    maxArea = area = -1;

    for (; rangeOffs < rangeTo; rangeOffs++) {
      // 三角形面積計算公式: 0.5 * |x1(y2-y3) + x2(y3-y1) + x3(y1-y2)|
      area = Math.abs((pointAX - avgX) * (data[rangeOffs].y - pointAY) - (pointAX - data[rangeOffs].x) * (avgY - pointAY)) * 0.5;
      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[rangeOffs];
        nextA = rangeOffs; // 下一輪的點 A 是這一輪選中的點 B
      }
    }

    sampled[sampledIndex++] = maxAreaPoint;
    a = nextA;
  }

  sampled[sampledIndex++] = data[size - 1]; // 最後一點必選

  return sampled;
}
