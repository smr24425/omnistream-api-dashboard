import React, { useState, useEffect } from 'react';
import styles from './AddPanelModal.module.scss';
import { FiActivity, FiTag, FiPlus, FiTrash2, FiLock } from 'react-icons/fi';
import type { Query, PanelType } from '../../../types/dashboard';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { PANEL_DEFINITIONS } from '../../../config/panelDefinitions';
import { BaseModal } from '../../ui/BaseModal/BaseModal';
import { FormField } from '../../ui/FormField/FormField';

interface PanelConfig {
  title: string;
  type: PanelType;
  queryId: string | string[];
  settings?: Record<string, any>;
}

interface AddPanelModalProps {
  isOpen: boolean;
  queries: Query[];
  onClose: () => void;
  onConfirm: (config: PanelConfig) => void;
  /** 編輯模式：傳入已有 panel 的 config 預填 */
  initialConfig?: PanelConfig;
}

export const AddPanelModal: React.FC<AddPanelModalProps> = ({
  isOpen,
  queries,
  onClose,
  onConfirm,
  initialConfig,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!initialConfig;

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PanelType>('LINE');
  const [queryId, setQueryId] = useState(queries[0]?.id || '');
  const [multiQueryIds, setMultiQueryIds] = useState<string[]>(
    [queries[0]?.id].filter(Boolean) as string[]
  );
  const [settings, setSettings] = useState<Record<string, any>>({});

  // 開啟時預填：編輯模式從 initialConfig 取值，建立模式重置
  useEffect(() => {
    if (!isOpen) return;
    if (initialConfig) {
      setTitle(initialConfig.title);
      setType(initialConfig.type);
      setSettings(initialConfig.settings || {});
      if (Array.isArray(initialConfig.queryId)) {
        setMultiQueryIds(initialConfig.queryId);
        setQueryId(initialConfig.queryId[0] || queries[0]?.id || '');
      } else {
        setQueryId(initialConfig.queryId);
        setMultiQueryIds([initialConfig.queryId]);
      }
    } else {
      setTitle('');
      setType('LINE');
      setQueryId(queries[0]?.id || '');
      setMultiQueryIds([queries[0]?.id].filter(Boolean) as string[]);
      setSettings({});
    }
    setStep(1);
  }, [isOpen, initialConfig]);

  const queryOptions = queries.map(q => ({
    value: q.id,
    label: q.name,
    icon: <FiActivity style={{ fontSize: '0.8rem', opacity: 0.7 }} />,
  }));

  const handleTypeChange = (newType: PanelType) => {
    setType(newType);
    const def = PANEL_DEFINITIONS[newType];
    const initialSettings: Record<string, any> = {};
    def.fields.forEach(f => {
      if (f.defaultValue !== undefined) initialSettings[f.name] = f.defaultValue;
    });
    setSettings(initialSettings);
  };

  const addQuery = () => setMultiQueryIds(prev => [...prev, queries[0]?.id || '']);
  const removeQuery = (index: number) => setMultiQueryIds(prev => prev.filter((_, i) => i !== index));
  const updateQuery = (index: number, newId: string) =>
    setMultiQueryIds(prev => { const next = [...prev]; next[index] = newId; return next; });

  const handleSubmit = () => {
    const def = PANEL_DEFINITIONS[type as string];
    const finalQueryId = def.allowMultiMetric ? multiQueryIds : queryId;
    if (Array.isArray(finalQueryId) && finalQueryId.length === 0) return;
    onConfirm({ title, type, queryId: finalQueryId, settings });
    onClose();
    setStep(1);
  };

  const renderStep1 = () => (
    <div className={styles.form}>
      <FormField label={<><FiTag className={styles.subIcon} /> {t('modals.addPanel.fieldTitle')}</>} required>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('modals.addPanel.placeholderTitle')}
          autoFocus
        />
      </FormField>

      <FormField label={<><FiActivity className={styles.subIcon} /> {t('modals.addPanel.fieldMetric')}</>} required>
        {PANEL_DEFINITIONS[type as string].allowMultiMetric ? (
          <div className={styles.multiSelect}>
            {multiQueryIds.map((qId, index) => (
              <div key={index} className={styles.queryRow}>
                <Dropdown
                  options={queryOptions}
                  value={qId}
                  onChange={(val) => updateQuery(index, val)}
                  className={styles.flexDropdown}
                />
                {multiQueryIds.length > 1 && (
                  <button type="button" className={styles.removeBtn} onClick={() => removeQuery(index)}>
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className={styles.addBtn} onClick={addQuery}>
              <FiPlus /> {t('modals.addPanel.addMetric')}
            </button>
          </div>
        ) : (
          <Dropdown
            options={queryOptions}
            value={queryId}
            onChange={setQueryId}
            className={styles.metricDropdown}
          />
        )}
      </FormField>

      {/* 編輯模式：顯示鎖定的類型（不可修改）；建立模式：顯示類型選擇器 */}
      {isEditMode ? (
        <div className={styles.typeLocked}>
          <FiLock className={styles.lockIcon} />
          <div className={styles.typeIcon}>{PANEL_DEFINITIONS[type]?.icon}</div>
          <span>{t(PANEL_DEFINITIONS[type]?.labelKey)}</span>
          <span className={styles.lockedHint}>({t('modals.addPanel.typeLockedHint', 'type cannot be changed')})</span>
        </div>
      ) : (
        <FormField label={t('modals.addPanel.fieldType')} required>
          <div className={styles.typeGrid}>
            {Object.values(PANEL_DEFINITIONS).map(def => (
              <div
                key={def.type}
                className={`${styles.typeOption} ${type === def.type ? styles.active : ''}`}
                onClick={() => handleTypeChange(def.type)}
              >
                <div className={styles.typeIcon}>{def.icon}</div>
                <span>{t(def.labelKey)}</span>
              </div>
            ))}
          </div>
        </FormField>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.form}>
      {PANEL_DEFINITIONS[type as string].fields.length > 0 ? (
        <div className={styles.advancedSection}>
          <h3 className={styles.sectionTitle}>{t('modals.addPanel.settings.sectionTitle')}</h3>
          <div className={styles.settingsGrid}>
            {PANEL_DEFINITIONS[type as string].fields.map((field: any) => (
              <div key={field.name} className={styles.settingField}>
                <label>{t(field.labelKey)}</label>
                {field.type === 'select' ? (
                  <Dropdown
                    options={(field.options || []).map((opt: any) => ({
                      value: opt.value,
                      label: opt.labelKey ? t(opt.labelKey) : (opt.label ?? opt.value),
                    }))}
                    value={(settings[field.name] ?? field.defaultValue ?? (field.options?.[0]?.value ?? '')) as string}
                    onChange={(val) => setSettings({
                      ...settings,
                      [field.name]: val
                    })}
                    className={styles.metricDropdown}
                  />
                ) : (
                  <input
                    type={field.type === 'color' ? 'color' : field.type}
                    value={settings[field.name] ?? ''}
                    onChange={e => setSettings({
                      ...settings,
                      [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value
                    })}
                    placeholder={field.placeholderKey ? t(field.placeholderKey) : ''}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className={styles.noSettings}>{t('modals.addPanel.settings.noSettings')}</p>
      )}
    </div>
  );

  // 編輯模式的 Modal 標題
  const modalTitle = isEditMode
    ? t('modals.addPanel.titleEdit', 'Edit Panel')
    : (step === 1 ? t('modals.addPanel.titleStep1') : t('modals.addPanel.titleStep2'));

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="700px"
      footer={
        <div className={styles.footerActions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {t('modals.common.cancel')}
          </button>
          <div className={styles.rightActions}>
            {step === 1 ? (
              <button
                className={styles.confirmBtn}
                onClick={() => setStep(2)}
                disabled={!title.trim() || (PANEL_DEFINITIONS[type].allowMultiMetric ? multiQueryIds.length === 0 : !queryId)}
              >
                {t('modals.common.next')}
              </button>
            ) : (
              <>
                <button className={styles.backBtn} onClick={() => setStep(1)}>
                  {t('modals.common.back')}
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={handleSubmit}
                  disabled={!title.trim()}
                >
                  {isEditMode ? t('modals.common.save') : t('modals.common.confirm')}
                </button>
              </>
            )}
          </div>
        </div>
      }
    >
      {step === 1 ? renderStep1() : renderStep2()}
    </BaseModal>
  );
};
