import React, { useState } from 'react';
import styles from './DataView.module.scss';
import { useTranslation } from 'react-i18next';
import {
  FiDatabase,
  FiTarget,
  FiTrash2,
  FiEdit2,
  FiHelpCircle
} from 'react-icons/fi';
import { QueryTutorial } from '../../components/ui/QueryTutorial/QueryTutorial';
import type { DataSource, Query } from '../../types/dashboard';
import { Table } from '../../components/ui/Table/Table';
import { CreateButton } from '../../components/ui/CreateButton/CreateButton';

interface DataViewProps {
  dataSources: DataSource[];
  queries: Query[];
  onAddSource: () => void;
  onAddQuery: () => void;
  onEditSource: (source: DataSource) => void;
  onEditQuery: (query: Query) => void;
  onDeleteSource: (id: string) => void;
  onDeleteQuery: (id: string) => void;
}

export const DataView: React.FC<DataViewProps> = ({
  dataSources,
  queries,
  onAddSource,
  onAddQuery,
  onEditSource,
  onEditQuery,
  onDeleteSource,
  onDeleteQuery
}) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'sources' | 'queries'>('sources');
  const [showTutorial, setShowTutorial] = useState(false);
  const currentLang = i18n.language as 'en' | 'zh';

  const sourceColumns = [
    {
      header: t('dataHub.sources.table.name'),
      key: 'name',
      render: (ds: DataSource) => (
        <div className={styles.nameCell}>
          <FiDatabase className={styles.icon} />
          {ds.name}
        </div>
      )
    },
    {
      header: t('dataHub.sources.table.url'),
      key: 'url',
      render: (ds: DataSource) => (
        <code className={styles.code}>
          {ds.url || 'Internal Mock Engine'}
        </code>
      )
    },
    {
      header: t('dataHub.sources.table.interval'),
      key: 'interval',
      render: (ds: DataSource) => `${ds.interval}ms`
    },
    {
      header: t('dataHub.sources.table.actions'),
      key: 'actions',
      render: (ds: DataSource) => (
        <div className={styles.rowActions}>
          <button
            className={styles.iconBtn}
            onClick={() => onEditSource(ds)}
            title="Edit Source"
          >
            <FiEdit2 />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.delete}`}
            onClick={() => onDeleteSource(ds.id)}
            title="Delete Source"
          >
            <FiTrash2 />
          </button>
        </div>
      )
    }
  ];

  // 2. 查詢表格欄位定義 (Queries)
  const queryColumns = [
    {
      header: t('dataHub.queries.table.name'),
      key: 'name',
      render: (q: Query) => (
        <div className={styles.nameCell}>
          <FiTarget className={styles.icon} />
          {q.name}
        </div>
      )
    },
    {
      header: t('dataHub.queries.table.source'),
      key: 'dataSourceId',
      render: (q: Query) => (
        <span className={styles.badge}>
          {dataSources.find(ds => ds.id === q.dataSourceId)?.name || 'Unknown'}
        </span>
      )
    },
    {
      header: t('dataHub.queries.table.path'),
      key: 'yPath',
      render: (q: Query) => (
        <code className={styles.code}>{q.yPath}</code>
      )
    },
    {
      header: t('dataHub.queries.table.actions'),
      key: 'actions',
      render: (q: Query) => (
        <div className={styles.rowActions}>
          <button
            className={styles.iconBtn}
            onClick={() => onEditQuery(q)}
            title="Edit Metric"
          >
            <FiEdit2 />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.delete}`}
            onClick={() => onDeleteQuery(q.id)}
            title="Delete Metric"
          >
            <FiTrash2 />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.dataHub}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'sources' ? styles.active : ''}`}
          onClick={() => setActiveTab('sources')}
        >
          <FiDatabase /> {t('dataHub.tabs.sources')}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'queries' ? styles.active : ''}`}
          onClick={() => setActiveTab('queries')}
        >
          <FiTarget /> {t('dataHub.tabs.queries')}
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'sources' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h1>{t('dataHub.sources.title')}</h1>
                <p>{t('dataHub.sources.desc')}</p>
              </div>
              <CreateButton onClick={onAddSource}>
                {t('dataHub.sources.add')}
              </CreateButton>
            </div>

            <Table
              data={dataSources}
              columns={sourceColumns}
              minWidth="700px"
            />
          </section>
        )}

        {activeTab === 'queries' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h1>{t('dataHub.queries.title')}</h1>
                <p>{t('dataHub.queries.desc')}</p>
              </div>
              <div className={styles.headerActions}>
                <button
                  className={`${styles.helpBtn} ${showTutorial ? styles.active : ''}`}
                  onClick={() => setShowTutorial(v => !v)}
                  title={showTutorial ? t('dataHub.tutorial.hide', 'Hide Guide') : t('dataHub.tutorial.show', 'Show Guide')}
                >
                  <FiHelpCircle />
                </button>
                <CreateButton onClick={onAddQuery}>
                  {t('dataHub.queries.add')}
                </CreateButton>
              </div>
            </div>

            {showTutorial && <QueryTutorial lang={currentLang} />}

            <Table
              data={queries}
              columns={queryColumns}
              minWidth="800px"
            />
          </section>
        )}
      </div>
    </div>
  );
};
