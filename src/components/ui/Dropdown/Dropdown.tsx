import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Dropdown.module.scss';
import { FiChevronDown } from 'react-icons/fi';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
  /**
   * Render menu in a portal (prevents clipping in scroll/overflow containers like modals).
   * Defaults to true.
   */
  portal?: boolean;
  /**
   * Max height of menu (px). Menu will scroll internally if exceeded.
   */
  menuMaxHeight?: number;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  icon,
  className = '',
  portal = true,
  menuMaxHeight = 260,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeOption = options.find(opt => opt.value === value);

  const [menuPos, setMenuPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
    openUp: boolean;
  } | null>(null);

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inTrigger = dropdownRef.current?.contains(target) ?? false;
      const inMenu = menuRef.current?.contains(target) ?? false;
      if (!inTrigger && !inMenu) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const computeMenuPosition = () => {
    const triggerEl = triggerRef.current;
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const GAP = 6;
    const VIEWPORT_PADDING = 8;

    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;

    const maxHeight = Math.max(120, Math.min(menuMaxHeight, (openUp ? spaceAbove : spaceBelow) - GAP));
    const top = openUp ? Math.max(VIEWPORT_PADDING, rect.top - GAP - maxHeight) : rect.bottom + GAP;

    // align to trigger left, clamp into viewport
    const desiredLeft = rect.left;
    const maxLeft = Math.max(VIEWPORT_PADDING, window.innerWidth - rect.width - VIEWPORT_PADDING);
    const left = Math.min(Math.max(VIEWPORT_PADDING, desiredLeft), maxLeft);

    setMenuPos({
      top,
      left,
      width: rect.width,
      maxHeight,
      openUp,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    computeMenuPosition();

    const handle = () => computeMenuPosition();
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, true);
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
    };
  }, [isOpen, menuMaxHeight]);

  const menu = useMemo(() => {
    if (!isOpen) return null;

    const menuClassName = portal ? styles.menuPortal : styles.menu;
    const menuStyle: React.CSSProperties | undefined = portal && menuPos
      ? {
          position: 'fixed',
          top: menuPos.top,
          left: menuPos.left,
          width: menuPos.width,
          maxHeight: menuPos.maxHeight,
          overflowY: 'auto',
        }
      : undefined;

    return (
      <div ref={menuRef} className={menuClassName} style={menuStyle}>
        {options.map((opt) => (
          <div
            key={opt.value}
            className={`${styles.option} ${opt.value === value ? styles.selected : ''}`}
            onClick={() => {
              onChange(opt.value);
              setIsOpen(false);
            }}
          >
            {opt.icon && <span className={styles.optIcon}>{opt.icon}</span>}
            {opt.label}
          </div>
        ))}
      </div>
    );
  }, [isOpen, menuPos, onChange, options, portal, value]);

  return (
    <div className={`${styles.dropdown} ${className} ${isOpen ? styles.active : ''}`} ref={dropdownRef}>
      <div
        ref={triggerRef}
        className={styles.trigger}
        onClick={() => setIsOpen(prev => !prev)}
      >
        {icon && <span className={styles.triggerIcon}>{icon}</span>}
        <span className={styles.label}>{activeOption?.label}</span>
        <FiChevronDown className={`${styles.chevron} ${isOpen ? styles.rotate : ''}`} />
      </div>

      {portal ? (isOpen ? createPortal(menu, document.body) : null) : menu}
    </div>
  );
};
