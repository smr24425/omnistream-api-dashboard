import React from 'react';
import styles from './PanelHeader.module.scss';
import { FiTrash2, FiMoreVertical } from 'react-icons/fi';

interface PanelHeaderProps {
  title: string;
  badge?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  actions?: React.ReactNode;
}

/**
 * PanelHeader - 全站圖表面板統一頭部組件
 */
export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  badge,
  onDelete,
  onEdit,
  actions
}) => {
  return (
    <div className={styles.header}>
      <div className={styles.titleGroup}>
        <span className={styles.title}>{title}</span>
        {badge && <div className={styles.badge}>{badge}</div>}
      </div>
      
      <div className={styles.actions}>
        {actions}
        {onDelete && (
          <button className={styles.deleteBtn} onClick={onDelete} title="Remove Panel">
            <FiTrash2 />
          </button>
        )}
        <button
          className={styles.moreBtn}
          onClick={onEdit}
          title="Edit Panel"
          style={{ opacity: onEdit ? 1 : 0.3, cursor: onEdit ? 'pointer' : 'default' }}
        >
          <FiMoreVertical />
        </button>
      </div>
    </div>
  );
};
