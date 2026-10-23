'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DocTableItem, DocumentModel, ReceiveToolsPreviewRow } from '@/app/interfaces/document.interface';
import { useAllReferences } from '@/app/components/lists/referencesList/hooks/useReferencesData';
import { numberValue } from '@/app/service/common/converters';
import { fetchReceiveToolsPreview } from '@/app/service/documents/fetchReceiveToolsPreview';
import {
  buildPickerRowsFromPreview,
  mergePickerSelectionsIntoDocument,
  PickerSelectionRow,
} from '@/app/service/documents/applyReceiveToolsPicker';
import { showMessage } from '@/app/service/common/showMessage';
import { resolvePartyDelivery } from '@/app/service/documents/fillReceiveToolsTable';
import { getReceiveToolsReturnDateTime } from '@/app/service/documents/receiveToolsRent';
import styles from './receiveToolsPickerModal.module.css';

interface ReceiveToolsPickerModalProps {
  open: boolean;
  currentDocument: DocumentModel;
  allDocItems: DocTableItem[];
  token: string | undefined;
  enterpriseId: number | null | undefined;
  setMainData: Function | undefined;
  onClose: () => void;
}

const formatDate = (ms?: number) => {
  if (!ms || !Number.isFinite(ms)) return '—';
  return new Date(ms).toLocaleString('ru-RU');
};

const rowKey = (row: PickerSelectionRow) =>
  row.batchId ? `b:${row.batchId}` : `${row.sourceTransferDocId}:${row.analiticId}`;

const roundCount = (n: number) => Math.round(n * 10000) / 10000;

export default function ReceiveToolsPickerModal({
  open,
  currentDocument,
  allDocItems,
  token,
  enterpriseId,
  setMainData,
  onClose,
}: ReceiveToolsPickerModalProps) {
  const { data: references } = useAllReferences(token);
  const [rows, setRows] = useState<PickerSelectionRow[]>([]);
  const [previewRows, setPreviewRows] = useState<ReceiveToolsPreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const referenceMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const ref of references || []) {
      if (ref.id) map.set(ref.id, ref.name || `ID ${ref.id}`);
    }
    return map;
  }, [references]);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setApplyError(null);
    try {
      const preview = await fetchReceiveToolsPreview(currentDocument, token, enterpriseId);
      const pickerRows = buildPickerRowsFromPreview(preview, allDocItems);
      setPreviewRows(preview);
      setRows(pickerRows);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Ошибка загрузки';
      setLoadError(message);
      setPreviewRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [currentDocument, allDocItems, enterpriseId, token]);

  useEffect(() => {
    if (open) {
      loadPreview();
    } else {
      setPreviewRows([]);
      setRows([]);
      setLoadError(null);
      setApplyError(null);
    }
  }, [open, loadPreview]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const nameA = referenceMap.get(a.analiticId) || `ID ${a.analiticId}`;
      const nameB = referenceMap.get(b.analiticId) || `ID ${b.analiticId}`;
      return nameA.localeCompare(nameB, 'uz');
    });
  }, [rows, referenceMap]);

  const applyColumnQty = (prev: PickerSelectionRow[], columnKey: string, qty: number) =>
    prev.map((row) => {
      if (rowKey(row) === columnKey) {
        return { ...row, returnQty: qty };
      }
      const column = prev.find((item) => rowKey(item) === columnKey);
      if (
        column?.billingRole === 'COLUMN' &&
        row.billingRole === 'COLUMN_COMPONENT' &&
        Number(row.assemblyBatchId) === Number(column.batchId)
      ) {
        return {
          ...row,
          returnQty: roundCount(qty * (Number(row.normQty) || 0)),
        };
      }
      return row;
    });

  const handleReturnQtyChange = (key: string, value: string) => {
    const parsed = value === '' ? 0 : Number(value);
    const qty = Number.isFinite(parsed) ? parsed : 0;
    setRows((prev) => {
      const target = prev.find((row) => rowKey(row) === key);
      if (target?.billingRole === 'COLUMN') {
        return applyColumnQty(prev, key, qty);
      }
      if (target?.billingRole === 'COLUMN_COMPONENT') return prev;
      return prev.map((row) => (rowKey(row) === key ? { ...row, returnQty: qty } : row));
    });
  };

  const handleFillAll = () => {
    setRows((prev) => {
      let next = prev.map((row) =>
        row.billingRole === 'COLUMN_COMPONENT' ? row : { ...row, returnQty: row.remainQty },
      );
      for (const row of next) {
        if (row.billingRole === 'COLUMN') {
          next = applyColumnQty(next, rowKey(row), row.remainQty);
        }
      }
      return next;
    });
  };

  const handleApply = () => {
    const returnDateTime = getReceiveToolsReturnDateTime(currentDocument);

    const result = mergePickerSelectionsIntoDocument(currentDocument, rows, returnDateTime);
    if ('error' in result) {
      setApplyError(result.error);
      return;
    }

    const partyDelivery = resolvePartyDelivery(result.docTableItems, previewRows);
    setMainData?.('currentDocument', {
      ...currentDocument,
      docTableItems: result.docTableItems,
      docValues: {
        ...currentDocument.docValues,
        deliverySum: partyDelivery.deliverySum || undefined,
        partyDeliveryCharged: partyDelivery.partyDeliveryCharged,
      },
    });

    const updatedCount = rows.filter((r) => (Number(r.returnQty) || 0) > 0).length;
    showMessage(
      `Ko'chirildi: ${updatedCount} qator`,
      'success',
      setMainData,
    );
    onClose();
  };

  if (!open) return null;

  const hasSelection = rows.some((row) => (Number(row.returnQty) || 0) > 0);

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>Выбор инструментов у клиента</h3>
        <p className={styles.subtitle}>
          Партии по дате выдачи клиенту. Укажите количество возврата.
        </p>

        <div className={styles.body}>
          {loading && <div className={styles.empty}>Загрузка…</div>}
          {!loading && loadError && <div className={styles.error}>{loadError}</div>}
          {!loading && !loadError && sortedRows.length === 0 && (
            <div className={styles.empty}>У клиента нет открытых инструментов</div>
          )}
          {!loading && !loadError && sortedRows.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colName}>Наименование</th>
                  <th className={styles.colNum}>Тариф</th>
                  <th className={styles.colNum}>Дата получения</th>
                  <th className={styles.colNum}>Остаток</th>
                  <th className={styles.colQty}>Возвращено</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => {
                  const key = rowKey(row);
                  const name = referenceMap.get(row.analiticId) || `ID ${row.analiticId}`;
                  const roleLabel =
                    row.billingRole === 'COLUMN'
                      ? 'колонна'
                      : row.billingRole === 'COLUMN_COMPONENT'
                        ? 'состав колонны'
                        : '';
                  return (
                    <tr key={key}>
                      <td className={styles.colName}>
                        {name}
                        {roleLabel ? ` (${roleLabel})` : ''}
                        <span className={styles.docRef}>№{row.transferDocNumber}</span>
                      </td>
                      <td className={styles.colNum}>{numberValue(Number(row.hourlyTariff) || 0)} сум</td>
                      <td className={styles.colNum}>{formatDate(row.settlementDate)}</td>
                      <td className={styles.colNum}>{row.remainQty}</td>
                      <td className={styles.colQty}>
                        <input
                          type="text"
                          inputMode="decimal"
                          className={styles.qtyInput}
                          value={row.returnQty || ''}
                          disabled={row.billingRole === 'COLUMN_COMPONENT'}
                          onChange={(e) => handleReturnQtyChange(key, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {applyError && <div className={styles.error}>{applyError}</div>}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.btn}
            onClick={handleFillAll}
            disabled={loading || rows.length === 0}
          >
            Заполнить всё
          </button>
          <div className={styles.footerEnd}>
            <button type="button" className={styles.btn} onClick={onClose}>
              Отмена
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleApply}
              disabled={loading || !hasSelection}
            >
              Перенести в документ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
