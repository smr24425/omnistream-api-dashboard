import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.scss';
import {
  FiGrid,
  FiDatabase,
  FiSettings
} from 'react-icons/fi';

import { useTranslation } from 'react-i18next';

interface SidebarProps { }

export const Sidebar: React.FC<SidebarProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', icon: <FiGrid />, path: '/', label: t('sidebar.dashboard') },
    { id: 'data', icon: <FiDatabase />, path: '/data-hub', label: t('sidebar.dataHub') },
    // { id: 'analytics', icon: <FiBarChart2 />, path: '#', label: t('sidebar.analytics') },
    // { id: 'actions', icon: <FiZap />, path: '#', label: t('sidebar.automation') },
  ];

  const bottomItems = [
    // { id: 'security', icon: <FiShield />, path: '#', label: t('sidebar.security') },
    { id: 'settings', icon: <FiSettings />, path: '/settings', label: t('sidebar.settings') },
  ];

  return (
    <aside className={`${styles.sidebar} hidden-mobile`}>
      <div className={styles.logo} onClick={() => navigate('/')} title="OmniStream">
        <img
          src={`${import.meta.env.BASE_URL}favicon.svg`}
          alt="OmniStream"
          className={styles.logoImg}
        />
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
            onClick={() => item.path !== '#' && navigate(item.path)}
            title={item.label}
          >
            {item.icon}
          </div>
        ))}
      </nav>

      <div className={styles.bottomNav}>
        {bottomItems.map((item) => (
          <div
            key={item.id}
            className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
            onClick={() => item.path !== '#' && navigate(item.path)}
            title={item.label}
          >
            {item.icon}
          </div>
        ))}
      </div>
    </aside>
  );
};
