'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './paymentNotFilledModal.module.css';

interface PaymentNotFilledModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PaymentNotFilledModal({
  open,
  onClose,
}: PaymentNotFilledModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (typeof document === 'undefined' || !open) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-not-filled-title"
      >
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.badge}>Внимание</div>
            <h3 id="payment-not-filled-title" className={styles.title}>
              Оплата не заполнена
            </h3>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.instruction}>
            Для проведения документа заполните оплату (хотя бы один вариант):
          </p>
          <ul className={styles.optionsList}>
            <li>Наличные</li>
            <li>Карта</li>
            <li>Курс + USD</li>
            <li>В долг + комментарий к долгу</li>
          </ul>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.btnConfirm} onClick={onClose}>
            Понятно
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
