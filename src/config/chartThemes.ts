export const CHART_COLORS = {
  // 專業配色方案
  palette: [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Rose
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#f97316'  // Orange
  ],

  // 基礎語義化顏色
  accent: '#4f46e5',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  white: '#ffffff',
  border: 'rgba(255, 255, 255, 0.05)',
  grid: 'rgba(255, 255, 255, 0.03)',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
};

/**
 * 根據索引獲取顏色，循環使用色板
 */
export const getPaletteColor = (index: number) => {
  return CHART_COLORS.palette[index % CHART_COLORS.palette.length];
};

export function withAlpha(color: string, alpha: number) {
  const a = Math.max(0, Math.min(1, alpha));
  // Pass-through for existing rgba()/hsla()
  if (/^(rgba|hsla)\(/i.test(color)) return color;

  // Convert #RRGGBB or #RGB to rgba()
  const hex = color.replace('#', '').trim();
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  return color;
}
