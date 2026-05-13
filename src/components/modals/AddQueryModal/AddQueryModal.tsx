import React, { useState, useEffect } from 'react';
import styles from './AddQueryModal.module.scss';
import { FiDatabase, FiTarget, FiActivity, FiClock } from 'react-icons/fi';
import type { DataSource, Query } from '../../../types/dashboard';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { BaseModal } from '../../ui/BaseModal/BaseModal';
import { FormField } from '../../ui/FormField/FormField';

interface AddQueryModalProps {
  isOpen: boolean;
  initialData?: Query;
  dataSources: DataSource[];
  onClose: () => void;
  onConfirm: (query: Query) => void;
}

export const AddQueryModal: React.FC<AddQueryModalProps> = ({ 
  isOpen, 
  initialData,
  dataSources, 
  onClose, 
  onConfirm 
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [dataSourceId, setDataSourceId] = useState('');
  const [yPath, setYPath] = useState('');
  const [tPath, setTPath] = useState('');
  const [unit, setUnit] = useState('');

  const dsOptions = dataSources.map(ds => ({
    value: ds.id,
    label: ds.name,
    icon: <FiDatabase style={{ fontSize: '0.8rem', opacity: 0.7 }} />
  }));

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDataSourceId(initialData.dataSourceId);
      setYPath(initialData.yPath);
      setTPath(initialData.tPath || '');
      setUnit(initialData.unit || '');
    } else {
      setName('');
      setDataSourceId(dataSources[0]?.id || '');
      setYPath('');
      setTPath('');
      setUnit('');
    }
  }, [initialData, isOpen, dataSources]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      id: initialData?.id || `q_${Date.now()}`,
      name,
      dataSourceId,
      yPath,
      tPath: tPath || undefined,
      unit: unit || undefined,
    });
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('modals.addQuery.editTitle') : t('modals.addQuery.title')}
      footer={
        <>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            {t('modals.common.cancel')}
          </button>
          <button type="submit" form="queryForm" className={styles.confirmBtn}>
            {initialData ? t('modals.common.save') : t('modals.common.confirm')}
          </button>
        </>
      }
    >
      <form id="queryForm" onSubmit={handleSubmit} className={styles.form}>
        <FormField label={<><FiTarget className={styles.subIcon} /> {t('modals.addQuery.fieldName')}</>} required>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Ethereum Real-time Price"
            required
            autoFocus
          />
        </FormField>

        <div className={styles.row}>
          <FormField label={<><FiDatabase className={styles.subIcon} /> {t('modals.addQuery.fieldSource')}</>} required>
            <Dropdown 
              options={dsOptions}
              value={dataSourceId}
              onChange={setDataSourceId}
              className={styles.sourceDropdown}
            />
          </FormField>
          <FormField label={<><FiActivity className={styles.subIcon} /> {t('modals.addQuery.fieldUnit')}</>}>
            <input 
              type="text" 
              value={unit} 
              onChange={e => setUnit(e.target.value)}
              placeholder="e.g. %, ms, MB/s"
            />
          </FormField>
        </div>

        <FormField label={<><FiActivity className={styles.subIcon} /> {t('modals.addQuery.fieldPath')}</>} required>
          <input 
            type="text" 
            value={yPath} 
            onChange={e => setYPath(e.target.value)}
            placeholder={t('modals.addQuery.placeholderPath')}
            required
          />
        </FormField>

        <div className={styles.field}>
          <label><FiClock className={styles.subIcon} /> {t('modals.addQuery.fieldTimePath')}</label>
          <input 
            type="text" 
            value={tPath} 
            onChange={e => setTPath(e.target.value)}
            placeholder="e.g. update_time"
          />
        </div>
      </form>
    </BaseModal>
  );
};
