import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseModal } from '../../ui/BaseModal/BaseModal';
import { FormField } from '../../ui/FormField/FormField';
import { FiGrid } from 'react-icons/fi';
import styles from './AddDashboardModal.module.scss';

interface AddDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export const AddDashboardModal: React.FC<AddDashboardModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  // 重置表單狀態
  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modals.addDashboard.title', 'Create New Dashboard')}
      footer={
        <div className={styles.footerActions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {t('modals.common.cancel')}
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            {t('modals.common.confirm')}
          </button>
        </div>
      }
    >
      <div className={styles.formGroup}>
        <FormField label={<><FiGrid className={styles.subIcon} /> {t('modals.addDashboard.fieldName', 'Dashboard Name')}</>} required>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('modals.addDashboard.placeholder')}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </FormField>
      </div>
    </BaseModal>
  );
};
