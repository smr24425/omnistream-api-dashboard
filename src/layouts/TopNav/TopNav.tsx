import React, { useState } from 'react';
import styles from './TopNav.module.scss';
import { FiPlay, FiPause, FiGlobe, FiMenu } from 'react-icons/fi';
import { Dropdown } from '../../components/ui/Dropdown/Dropdown';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { MobileMenu } from '../../components/ui/MobileMenu/MobileMenu';

interface TopNavProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onUpdateLanguage: (lang: 'en' | 'zh') => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  isPaused,
  onTogglePause,
  onUpdateLanguage
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 動態麵包屑邏輯
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return t('topNav.mainEngine');
    if (path === '/data-hub') return t('sidebar.dataHub');
    if (path === '/settings') return t('sidebar.settings');
    if (path === '/analytics') return t('sidebar.analytics');
    return path.split('/').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
  };

  return (
    <header className={styles.topNav}>
      <button className={`visible-mobile ${styles.actionBtn}`} onClick={() => setIsMenuOpen(true)}>
        <FiMenu />
      </button>
      <div className={`${styles.left} hidden-mobile`}>
        <div className={styles.breadcrumb}>
          <span className={styles.folder}>{t('topNav.dashboards')}</span>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>{getBreadcrumb()}</span>
        </div>
      </div>
      <div className={`${styles.right} hidden-mobile`}>
        <button
          className={`${styles.actionBtn} ${isPaused ? styles.paused : styles.running}`}
          onClick={onTogglePause}
          title={isPaused ? t('topNav.resume') : t('topNav.pause')}
        >
          {isPaused ? <FiPlay /> : <FiPause />}
          <span>{isPaused ? t('topNav.resume') : t('topNav.live')}</span>
        </button>

        <div className={styles.divider} />

        <Dropdown
          value={i18n.language}
          onChange={(val) => onUpdateLanguage(val as 'en' | 'zh')}
          options={[
            { value: 'en', label: 'English' },
            { value: 'zh', label: '繁體中文' }
          ]}
          icon={<FiGlobe />}
        />

        {/* <button className={styles.actionBtn} title={t('topNav.share')}><FiShare2 /></button>
        <button className={styles.actionBtn} title={t('topNav.save')} onClick={onSave}><FiSave /></button> */}
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isPaused={isPaused}
        onTogglePause={onTogglePause}
        onUpdateLanguage={onUpdateLanguage}
      />
    </header>
  );
};
