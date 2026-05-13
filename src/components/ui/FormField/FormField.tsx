import React from 'react';
import styles from './FormField.module.scss';

interface FormFieldProps {
  label: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  required, 
  children, 
  className = '',
  error
}) => {
  return (
    <div className={`${styles.fieldContainer} ${className}`}>
      <div className={styles.labelWrapper}>
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      </div>
      <div className={styles.inputWrapper}>
        {children}
        {error && <div className={styles.errorText}>{error}</div>}
      </div>
    </div>
  );
};
