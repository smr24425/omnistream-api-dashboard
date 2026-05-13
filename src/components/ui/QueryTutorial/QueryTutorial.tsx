import React from 'react';
import styles from './QueryTutorial.module.scss';
import { MarkdownView } from '../MarkdownView/MarkdownView';

// 導入 Markdown 內容 (使用 Vite 的 ?raw 功能)
import apiGuideEn from '../../../docs/api-guide.en.md?raw';
import apiGuideZh from '../../../docs/api-guide.zh.md?raw';

interface QueryTutorialProps {
  lang?: 'en' | 'zh';
}

export const QueryTutorial: React.FC<QueryTutorialProps> = ({ lang = 'en' }) => {
  const content = lang === 'zh' ? apiGuideZh : apiGuideEn;

  return (
    <div className={styles.tutorialContainer}>
      <MarkdownView content={content} />
    </div>
  );
};
