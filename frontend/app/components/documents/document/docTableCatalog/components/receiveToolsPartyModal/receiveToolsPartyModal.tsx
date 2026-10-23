'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DocumentModel, ReceiveToolsPreviewRow } from '@/app/interfaces/document.interface';
import { fetchReceiveToolsPreview } from '@/app/service/documents/fetchReceiveToolsPreview';
import {
  fillReceiveToolsFromTransfer,
  groupReceiveToolsPreviewByTransfer,
  ReceiveToolsPartyOption,
} from '@/app/service/documents/fillReceiveToolsTable';
import { formatReturnQty } from '@/app/service/documents/formworkPanelArea';
import styles from '../receiveToolsPickerModal/receiveToolsPickerModal.module.css';

interface ReceiveToolsPartyModalProps {
  open: boolean;
  currentDocument: DocumentModel;
  token: string | undefined;
  enterpriseId: number | null | undefined;
  setMainData: Function | undefined;
  onClose: () => void;
}

const formatDate = (ms?: number) => {
  if (!ms || !Number.isFinite(ms)) return '—';
  return new Date(ms).toLocaleString('ru-RU');
};

export default function ReceiveToolsPartyModal({
  open,
  currentDocument,
  token,
  enterpriseId,
  setMainData,
  onClose,
}: ReceiveToolsPartyModalProps) {
  const [parties, setParties] = useState<ReceiveToolsPartyOption[]>([]);
  const [previewRows, setPreviewRows] = useState<ReceiveToolsPreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const preview = await fetchReceiveToolsPreview(currentDocument, token, enterpriseId);
      setPreviewRows(preview);
      setParties(groupReceiveToolsPreviewByTransfer(preview));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Ошибка загрузки';
      setLoadError(message);
      setPreviewRows([]);
      setParties([]);
    } finally {
      setLoading(false);
    }
  }, [currentDocument, enterpriseId, token]);

  useEffect(() => {
    if (open) {
      loadPreview();
    } else {
      setParties([]);
      setPreviewRows([]);
      setLoadError(null);
    }
  }, [open, loadPreview]);

  const handleSelect = (party: ReceiveToolsPartyOption) => {
    const applied = fillReceiveToolsFromTransfer(
      currentDocument,
      setMainData,
      previewRows,
      party.sourceTransferDocId,
    );
    if (applied) onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>С какой передачи возврат</h3>
        <p className={styles.subtitle}>
          Выберите партию. Таблица заполнится остатком этой передачи.
        </p>

        <div className={styles.body}>
          {loading && <div className={styles.empty}>Загрузка…</div>}
          {!loading && loadError && <div className={styles.error}>{loadError}</div>}
          {!loading && !loadError && parties.length === 0 && (
            <div className={styles.empty}>У клиента нет открытых ускуналар</div>
          )}
          {!loading && !loadError && parties.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colComment}>Комментарий</th>
                  <th className={styles.colNum}>№ передачи</th>
                  <th className={styles.colNum}>Дата выдачи</th>
                  <th className={styles.colNum}>Позиций</th>
                  <th className={styles.colNum}>Остаток</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((party) => (
                  <tr
                    key={party.sourceTransferDocId}
                    className={styles.partyRow}
                    onClick={() => handleSelect(party)}
                  >
                    <td className={styles.colComment}>
                      {party.transferDocComment || '—'}
                    </td>
                    <td className={styles.colNum}>№{party.transferDocNumber}</td>
                    <td className={styles.colNum}>{formatDate(party.settlementDate)}</td>
                    <td className={styles.colNum}>{party.lineCount}</td>
                    <td className={styles.colNum}>{formatReturnQty(party.remainQty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerEnd}>
            <button type="button" className={styles.btn} onClick={onClose}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
