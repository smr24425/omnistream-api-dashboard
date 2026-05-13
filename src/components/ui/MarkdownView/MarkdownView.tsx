import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MarkdownView.module.scss';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  return (
    <div className={`${styles.markdownContent} ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定義渲染樣式
          h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
          h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
          code: ({ children, className }) => {
            const inline = !className;
            return inline ? (
              <code className={styles.inlineCode}>{children}</code>
            ) : (
              <pre className={styles.codeBlock}>
                <code>{children}</code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <div className={styles.alert}>
              {children}
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
