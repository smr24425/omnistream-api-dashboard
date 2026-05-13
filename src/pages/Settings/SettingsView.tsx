import React from 'react';
import styles from './SettingsView.module.scss';
import { ProxyGuide } from '../../components/ui/ProxyGuide/ProxyGuide';
import { Dropdown } from '../../components/ui/Dropdown/Dropdown';
import {
  FiGlobe,
  FiAlertTriangle
} from 'react-icons/fi';

import { useTranslation } from 'react-i18next';

interface SettingsViewProps {
  proxyUrl: string;
  onUpdateProxy: (url: string) => void;
  onUpdateLanguage: (lang: 'en' | 'zh') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  proxyUrl,
  onUpdateProxy,
  onUpdateLanguage
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'zh';

  return (
    <div className={styles.settingsPage}>
      <header className={styles.pageHeader}>
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.desc')}</p>
      </header>

      <div className={styles.content}>
        {/* CORS Proxy 設定 */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <FiGlobe className={styles.icon} />
            <div>
              <h3>{t('settings.proxy.title')}</h3>
              <p>{t('settings.proxy.desc')}</p>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>{t('settings.proxy.url')}</label>
            <input
              type="text"
              value={proxyUrl}
              onChange={(e) => onUpdateProxy(e.target.value)}
              placeholder="https://your-proxy.workers.dev"
            />
            {/* <span className={styles.hint}>{t('settings.proxy.hint')}</span> */}
          </div>

          <div className={styles.guideWrapper}>
            <ProxyGuide lang={currentLang} />
          </div>
        </section>

        {/* 語系設定 */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <FiGlobe className={styles.icon} style={{ color: '#818cf8' }} />
            <div>
              <h3>{t('settings.language.title')}</h3>
              <p>{t('settings.language.desc')}</p>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>{t('settings.language.label')}</label>
            <Dropdown
              value={currentLang}
              onChange={(val) => onUpdateLanguage(val as 'en' | 'zh')}
              options={[
                { value: 'en', label: 'English (US)' },
                { value: 'zh', label: '繁體中文 (Taiwan)' }
              ]}
              className={styles.fullWidthDropdown}
            />
          </div>
        </section>

        {/* 危險區域 */}
        <section className={`${styles.card} ${styles.danger}`}>
          <div className={styles.cardHeader}>
            <FiAlertTriangle className={styles.icon} />
            <div>
              <h3>{t('settings.danger.title')}</h3>
              <p>{t('settings.danger.desc')}</p>
            </div>
          </div>
          <div className={styles.actionRow}>
            <div>
              <strong>{t('settings.danger.resetTitle')}</strong>
              <p>{t('settings.danger.resetDesc')}</p>
            </div>
            <button className={styles.dangerBtn} onClick={() => {
              if (window.confirm(t('settings.danger.confirm'))) {
                localStorage.clear();
                window.location.reload();
              }
            }}>{t('settings.danger.resetBtn')}</button>
          </div>
        </section>
      </div>
    </div>
  );
};
