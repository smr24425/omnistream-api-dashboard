import React from 'react';
import styles from './ConfirmModal.module.scss';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

import { useTranslation } from 'react-i18next';

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onClose, 
  onConfirm 
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <FiAlertTriangle className={styles.warningIcon} />
            <h2>{title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
        </div>
        
        <div className={styles.content}>
          <p>{message}</p>
        </div>
        
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {t('modals.common.cancel')}
          </button>
          <button className={styles.confirmBtn} onClick={() => { onConfirm(); onClose(); }}>
            {t('modals.common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
