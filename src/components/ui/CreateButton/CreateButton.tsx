import React from 'react';
import styles from './CreateButton.module.scss';
import { FiPlus } from 'react-icons/fi';

interface CreateButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
  title?: string;
}

export const CreateButton: React.FC<CreateButtonProps> = ({ 
  onClick, 
  children, 
  className = '', 
  title 
}) => {
  return (
    <button 
      className={`${styles.createBtn} ${className}`} 
      onClick={onClick}
      title={title}
    >
      <FiPlus className={styles.icon} />
      {children && <span className={styles.text}>{children}</span>}
    </button>
  );
};
