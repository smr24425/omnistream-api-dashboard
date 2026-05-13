import React from 'react';
import { FiTrendingUp, FiHash, FiDisc, FiBarChart, FiBarChart2, FiPieChart } from 'react-icons/fi';
import type { PanelType } from '../types/dashboard';

export interface PanelField {
  name: string;
  labelKey: string; // 用於多國語言標籤
  type: 'number' | 'text' | 'select' | 'color';
  required: boolean;
  defaultValue?: any;
  placeholderKey?: string;
  options?: Array<{
    value: string;
    labelKey?: string;
    label?: string;
  }>;
}

export interface PanelDefinition {
  type: PanelType;
  labelKey: string;
  icon: React.ReactNode; // React Icon 元件
  allowMultiMetric: boolean;
  fields: PanelField[];
}

export const PANEL_DEFINITIONS: Record<string, PanelDefinition> = {
  LINE: {
    type: 'LINE',
    labelKey: 'modals.addPanel.types.LINE',
    icon: <FiTrendingUp />,
    allowMultiMetric: true,
    fields: [
      { name: 'yMin', labelKey: 'modals.addPanel.settings.yMin', type: 'number', required: false },
      { name: 'yMax', labelKey: 'modals.addPanel.settings.yMax', type: 'number', required: false }
    ]
  },
  STAT: {
    type: 'STAT',
    labelKey: 'modals.addPanel.types.STAT',
    icon: <FiHash />,
    allowMultiMetric: false,
    fields: [
      { name: 'precision', labelKey: 'modals.addPanel.settings.precision', type: 'number', required: false, defaultValue: 1 }
    ]
  },
  GAUGE: {
    type: 'GAUGE',
    labelKey: 'modals.addPanel.types.GAUGE',
    icon: <FiDisc />,
    allowMultiMetric: false,
    fields: [
      { name: 'min', labelKey: 'modals.addPanel.settings.min', type: 'number', required: false, defaultValue: 0 },
      { name: 'max', labelKey: 'modals.addPanel.settings.max', type: 'number', required: true, defaultValue: 100 },
      {
        name: 'betterWhen',
        labelKey: 'modals.addPanel.settings.betterWhen',
        type: 'select',
        required: true,
        defaultValue: 'lower',
        options: [
          { value: 'higher', labelKey: 'modals.addPanel.settings.betterWhenHigher' },
          { value: 'lower', labelKey: 'modals.addPanel.settings.betterWhenLower' },
        ],
      },
    ]
  },
  BAR: {
    type: 'BAR',
    labelKey: 'modals.addPanel.types.BAR',
    icon: <FiBarChart />,   // Feather 的 BarChart 是橫向條形
    allowMultiMetric: true,
    fields: [
    ]
  },
  SPARKLINE: {
    type: 'SPARKLINE',
    labelKey: 'modals.addPanel.types.SPARKLINE',
    icon: <FiBarChart2 />,  // Feather 的 BarChart2 是直向柱狀
    allowMultiMetric: false,
    fields: [
      { name: 'precision', labelKey: 'modals.addPanel.settings.precision', type: 'number', required: false }
    ]
  },
  DONUT: {
    type: 'DONUT',
    labelKey: 'modals.addPanel.types.DONUT',
    icon: <FiPieChart />,
    allowMultiMetric: true,
    fields: [
      { name: 'precision', labelKey: 'modals.addPanel.settings.precision', type: 'number', required: false, defaultValue: 1 }
    ]
  },
};
