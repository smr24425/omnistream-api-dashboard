import React from 'react';
import styles from './ProxyGuide.module.scss';
import { MarkdownView } from '../MarkdownView/MarkdownView';

// 導入 Markdown 內容 (使用 Vite 的 ?raw 功能)
import corsGuideEn from '../../../docs/cors-proxy.en.md?raw';
import corsGuideZh from '../../../docs/cors-proxy.zh.md?raw';

interface ProxyGuideProps {
  lang?: 'en' | 'zh';
}

export const ProxyGuide: React.FC<ProxyGuideProps> = ({ lang = 'en' }) => {
  const content = lang === 'zh' ? corsGuideZh : corsGuideEn;

  return (
    <div className={styles.proxyGuide}>
      <MarkdownView content={content} />
    </div>
  );
};
