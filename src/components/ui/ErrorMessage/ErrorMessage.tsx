import React from 'react';
import styles from './ErrorMessage.module.scss';
import { FiAlertTriangle } from 'react-icons/fi';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className={styles.errorOverlay}>
      <FiAlertTriangle className={styles.icon} />
      <span className={styles.title}>Data Analysis Error</span>
      <p className={styles.message}>{message}</p>
    </div>
  );
};
