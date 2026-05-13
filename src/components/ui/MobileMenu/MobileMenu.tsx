import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom';
import {
  FiGrid,
  FiDatabase,
  FiSettings,
  FiX,
  FiChevronDown,
  FiGlobe,
  FiPlay,
  FiPause
} from 'react-icons/fi';
import styles from './MobileMenu.module.scss';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onUpdateLanguage: (lang: 'en' | 'zh') => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  isPaused,
  onTogglePause,
  onUpdateLanguage,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // 控制語言選單展開狀態
  const [isLangOpen, setIsLangOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: <FiGrid />, path: '/', label: t('sidebar.dashboard') },
    { id: 'data', icon: <FiDatabase />, path: '/data-hub', label: t('sidebar.dataHub') },
    { id: 'settings', icon: <FiSettings />, path: '/settings', label: t('sidebar.settings') },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    onClose(); // 點擊導覽後自動關閉
  };

  const content = (
    <>
      {/* 遮罩層 */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.show : ''}`}
        onClick={onClose}
      />

      {/* 側邊選單主體 */}
      <aside className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}>
        {/* Header: Logo 與 關閉按鈕 */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src="/favicon.svg" alt="Logo" />
            <span>OmniStream</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* 中間導覽區 */}
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
              onClick={() => handleNav(item.path)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </div>
          ))}

          {/* 分隔線 */}
          <div className={styles.menuDivider} />

          {/* 多國語言展開項 */}
          <div className={styles.langCollapse}>
            <div
              className={`${styles.navItem} ${isLangOpen ? styles.expanded : ''}`}
              onClick={() => setIsLangOpen(!isLangOpen)}
            >
              <span className={styles.icon}><FiGlobe /></span>
              <span className={styles.label}>
                {i18n.language === 'zh' ? '繁體中文' : 'English'}
              </span>
              <FiChevronDown className={`${styles.arrow} ${isLangOpen ? styles.rotate : ''}`} />
            </div>

            {/* 語言子選項 */}
            <div className={`${styles.subItems} ${isLangOpen ? styles.show : ''}`}>
              <div
                className={`${styles.subItem} ${i18n.language === 'zh' ? styles.active : ''}`}
                onClick={() => { onUpdateLanguage('zh'); setIsLangOpen(false); }}
              >
                繁體中文
              </div>
              <div
                className={`${styles.subItem} ${i18n.language === 'en' ? styles.active : ''}`}
                onClick={() => { onUpdateLanguage('en'); setIsLangOpen(false); }}
              >
                English
              </div>
            </div>
          </div>
        </nav>

        {/* 底部固定操作區 (Pause/Resume) */}
        <div className={styles.footer}>
          <button
            className={`${styles.mobileActionBtn} ${isPaused ? styles.paused : styles.running}`}
            onClick={onTogglePause}
          >
            {isPaused ? <FiPlay /> : <FiPause />}
            <span>{isPaused ? t('topNav.resume') : t('topNav.live')}</span>
          </button>
        </div>
      </aside>
    </>
  );

  // 使用 Portal 確保選單在 DOM 最頂層，不受 Header 樣式限制
  return ReactDOM.createPortal(content, document.body);
};