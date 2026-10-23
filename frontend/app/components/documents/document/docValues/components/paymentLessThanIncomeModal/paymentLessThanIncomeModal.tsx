'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './paymentLessThanIncomeModal.module.css';

interface PaymentLessThanIncomeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PaymentLessThanIncomeModal({
  open,
  onClose,
}: PaymentLessThanIncomeModalProps) {
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
        aria-labelledby="payment-less-than-income-title"
      >
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.badge}>Внимание</div>
            <h3 id="payment-less-than-income-title" className={styles.title}>
              Сумма оплаты меньше начисления
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
            Для проведения документа сумма оплат не должна быть меньше начисления:
          </p>
          <ul className={styles.optionsList}>
            <li>Наличные + Карта + (Курс × USD) + В долг</li>
            <li>≥ Итог (возврат/продажа + доставка + брак)</li>
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
