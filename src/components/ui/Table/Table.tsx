import React from 'react';
import styles from './Table.module.scss';

interface Column<T> {
  header: string;
  key: string;
  render?: (item: T) => React.ReactNode; // 自定義渲染邏輯 (例如 Badge, Icon)
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  minWidth?: string; // 控制手機版捲動的閾值
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  minWidth = '800px'
}: TableProps<T>) {
  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableScrollArea} style={{ '--min-width': minWidth } as React.CSSProperties}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  No Data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}