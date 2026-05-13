import React, { useState, useEffect } from 'react';
import styles from './AddDataSourceModal.module.scss';
import { FiGlobe, FiClock, FiKey } from 'react-icons/fi';
import type { DataSource } from '../../../types/dashboard';
import { BaseModal } from '../../ui/BaseModal/BaseModal';
import { FormField } from '../../ui/FormField/FormField';

interface AddDataSourceModalProps {
  isOpen: boolean;
  initialData?: DataSource;
  onClose: () => void;
  onConfirm: (source: DataSource) => void;
}

import { useTranslation } from 'react-i18next';

export const AddDataSourceModal: React.FC<AddDataSourceModalProps> = ({ 
  isOpen, 
  initialData,
  onClose, 
  onConfirm 
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [interval, setIntervalValue] = useState(5000);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUrl(initialData.url);
      setIntervalValue(initialData.interval);
      setApiKey(''); 
    } else {
      setName('');
      setUrl('');
      setIntervalValue(5000);
      setApiKey('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      id: initialData?.id || `ds_${Date.now()}`,
      name,
      url,
      interval,
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : (initialData?.headers || {})
    });
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('modals.addSource.editTitle') : t('modals.addSource.title')}
      footer={
        <>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            {t('modals.common.cancel')}
          </button>
          <button type="submit" form="dataSourceForm" className={styles.confirmBtn}>
            {initialData ? t('modals.common.save') : t('modals.common.confirm')}
          </button>
        </>
      }
    >
      <form id="dataSourceForm" onSubmit={handleSubmit} className={styles.form}>
        <FormField label={t('modals.addSource.fieldName')} required>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)}
            placeholder="e.g. My Custom API"
            required
            autoFocus
          />
        </FormField>

        <FormField label={<><FiGlobe className={styles.subIcon} /> {t('modals.addSource.fieldUrl')}</>} required>
          <input 
            type="url" 
            value={url} 
            onChange={e => setUrl(e.target.value)}
            placeholder={t('modals.addSource.placeholderUrl')}
            required
          />
        </FormField>

        <div className={styles.row}>
          <FormField label={<><FiClock className={styles.subIcon} /> {t('modals.addSource.fieldInterval')}</>}>
            <input 
              type="number" 
              value={interval} 
              onChange={e => setIntervalValue(Number(e.target.value))}
              min="500"
            />
          </FormField>
          <FormField label={<><FiKey className={styles.subIcon} /> API Key (Optional)</>}>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)}
              placeholder={initialData ? "Leave empty to keep existing" : "Bearer token..."}
            />
          </FormField>
        </div>
      </form>
    </BaseModal>
  );
};
