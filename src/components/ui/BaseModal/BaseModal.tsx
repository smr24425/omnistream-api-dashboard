import React, { useEffect } from 'react';
import styles from './BaseModal.module.scss';
import { FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

/**
 * BaseModal - 全站統一的高級玻璃擬態彈窗基礎組件
 */
export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '550px',
  className = ''
}) => {
  const { t } = useTranslation();

  // ESC 鍵關閉支援
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const isMouseDownOnOverlay = React.useRef(false);

  if (!isOpen) return null;

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      isMouseDownOnOverlay.current = true;
    }
  };

  const handleOverlayMouseUp = (e: React.MouseEvent) => {
    if (isMouseDownOnOverlay.current && e.target === e.currentTarget) {
      onClose();
    }
    isMouseDownOnOverlay.current = false;
  };

  return (
    <div 
      className={styles.overlay} 
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
    >
      <div
        className={`${styles.modal} ${className}`}
        style={{ maxWidth }}
      >
        <div className={styles.header}>
          <h2>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} title={t('modals.common.cancel')}>
            <FiX />
          </button>
        </div>

        <div className={styles.body}>
          {children}
        </div>

        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
