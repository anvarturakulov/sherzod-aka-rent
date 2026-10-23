'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DocTableItem,
  DocumentModel,
  TransferColumnPreview,
} from '@/app/interfaces/document.interface';
import { useAllReferences } from '@/app/components/lists/referencesList/hooks/useReferencesData';
import { numberValue } from '@/app/service/common/converters';
import {
  fetchTransferColumnPreview,
  fetchTransferToolsPreview,
} from '@/app/service/documents/fetchTransferToolsPreview';
import {
  buildTransferPickerRowsFromPreview,
  columnAvailability,
  ColumnPickerRow,
  mergeColumnSelectionsIntoDocument,
  mergeTransferPickerSelectionsIntoDocument,
  TransferPickerSelectionRow,
} from '@/app/service/documents/applyTransferToolsPicker';
import { showMessage } from '@/app/service/common/showMessage';
import { compareToolsByArticle } from '@/app/service/documents/sortToolsByArticle';
import styles from './transferToolsPickerModal.module.css';

interface TransferToolsPickerModalProps {
  open: boolean;
  currentDocument: DocumentModel;
  allDocItems: DocTableItem[];
  token: string | undefined;
  enterpriseId: number | null | undefined;
  setMainData: Function | undefined;
  onClose: () => void;
}

export default function TransferToolsPickerModal({
  open,
  currentDocument,
  allDocItems,
  token,
  enterpriseId,
  setMainData,
  onClose,
}: TransferToolsPickerModalProps) {
  const { data: references } = useAllReferences(token);
  const [rows, setRows] = useState<TransferPickerSelectionRow[]>([]);
  const [columnSource, setColumnSource] = useState<TransferColumnPreview[]>([]);
  const [columnQty, setColumnQty] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const referenceMap = useMemo(() => {
    const map = new Map<number, { name: string; article: string }>();
    for (const ref of references || []) {
      if (ref.id) {
        map.set(ref.id, {
          name: ref.name || `ID ${ref.id}`,
          article: ref.article || '',
        });
      }
    }
    return map;
  }, [references]);

  const nameOf = useCallback(
    (id: number) => referenceMap.get(id)?.name || `ID ${id}`,
    [referenceMap],
  );

  const compareByArticle = useCallback(
    (idA: number, idB: number) => {
      const a = referenceMap.get(idA);
      const b = referenceMap.get(idB);
      return compareToolsByArticle(
        { article: a?.article, name: a?.name },
        { article: b?.article, name: b?.name },
      );
    },
    [referenceMap],
  );

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setApplyError(null);
    try {
      const [preview, columns] = await Promise.all([
        fetchTransferToolsPreview(currentDocument, token, enterpriseId),
        fetchTransferColumnPreview(currentDocument, token, enterpriseId),
      ]);
      setRows(buildTransferPickerRowsFromPreview(preview, allDocItems));
      setColumnSource(columns);
      setColumnQty({});
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Ошибка загрузки';
      setLoadError(message);
      setRows([]);
      setColumnSource([]);
    } finally {
      setLoading(false);
    }
  }, [currentDocument, allDocItems, enterpriseId, token]);

  useEffect(() => {
    if (open) {
      loadPreview();
    } else {
      setRows([]);
      setColumnSource([]);
      setColumnQty({});
      setLoadError(null);
      setApplyError(null);
    }
  }, [open, loadPreview]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => compareByArticle(a.analiticId, b.analiticId));
  }, [rows, compareByArticle]);

  const columnRows = useMemo((): ColumnPickerRow[] => {
    const allocated = new Map<number, number>();
    for (const item of allDocItems) {
      if (item.billingRole === 'COLUMN' || !item.analiticId) continue;
      allocated.set(
        item.analiticId,
        (allocated.get(item.analiticId) || 0) + (Number(item.count) || 0),
      );
    }
    for (const row of rows) {
      const extra = Number(row.transferQty) || 0;
      if (extra <= 0) continue;
      allocated.set(row.analiticId, (allocated.get(row.analiticId) || 0) + extra);
    }
    return columnSource
      .map((column) => {
        const liveAllocated = new Map(allocated);
        for (const other of columnSource) {
          if (other.analiticId === column.analiticId) continue;
          const qty = Number(columnQty[other.analiticId]) || 0;
          if (qty <= 0) continue;
          for (const part of other.parts) {
            liveAllocated.set(
              part.analiticId,
              (liveAllocated.get(part.analiticId) || 0) + qty * (Number(part.normQty) || 0),
            );
          }
        }
        const { availableQty, limitNote } = columnAvailability(column, liveAllocated, nameOf);
        return {
          ...column,
          availableQty,
          limitNote,
          transferQty: Number(columnQty[column.analiticId]) || 0,
        };
      })
      .sort((a, b) => compareByArticle(a.analiticId, b.analiticId));
  }, [allDocItems, rows, columnSource, columnQty, nameOf, compareByArticle]);

  const handleTransferQtyChange = (analiticId: number, value: string) => {
    const parsed = value === '' ? 0 : Number(value);
    setRows((prev) =>
      prev.map((row) =>
        row.analiticId === analiticId
          ? { ...row, transferQty: Number.isFinite(parsed) ? parsed : 0 }
          : row,
      ),
    );
  };

  const handleColumnQtyChange = (analiticId: number, value: string) => {
    const parsed = value === '' ? 0 : Number(value);
    setColumnQty((prev) => ({
      ...prev,
      [analiticId]: Number.isFinite(parsed) ? parsed : 0,
    }));
  };

  const moveQtyFocus = (current: HTMLInputElement, direction: 1 | -1) => {
    const dialog = current.closest(`.${styles.dialog}`);
    if (!dialog) return;
    const inputs = Array.from(
      dialog.querySelectorAll<HTMLInputElement>(`input.${styles.qtyInput}:not(:disabled)`),
    );
    const index = inputs.indexOf(current);
    if (index < 0) return;
    const next = inputs[index + direction];
    if (!next) return;
    next.focus();
    next.select();
  };

  const handleQtyKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    moveQtyFocus(event.currentTarget, event.key === 'ArrowUp' ? -1 : 1);
  };

  const handleQtyFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  };

  const handleFillAll = () => {
    setRows((prev) => prev.map((row) => ({ ...row, transferQty: row.remainQty })));
  };

  const handleApply = async () => {
    setApplying(true);
    setApplyError(null);
    try {
      const stockSelected = rows.some((row) => (Number(row.transferQty) || 0) > 0);
      const columnSelected = columnRows.some((row) => (Number(row.transferQty) || 0) > 0);
      if (!stockSelected && !columnSelected) {
        setApplyError('Укажите количество хотя бы для одной строки');
        return;
      }

      let docTableItems = [...(currentDocument.docTableItems || [])];
      if (stockSelected) {
        const stockResult = await mergeTransferPickerSelectionsIntoDocument(
          { ...currentDocument, docTableItems },
          rows,
          token,
          enterpriseId,
        );
        if ('error' in stockResult) {
          setApplyError(stockResult.error);
          return;
        }
        docTableItems = stockResult.docTableItems;
      }

      if (columnSelected) {
        const columnResult = mergeColumnSelectionsIntoDocument(docTableItems, columnRows);
        if ('error' in columnResult) {
          setApplyError(columnResult.error);
          return;
        }
        docTableItems = columnResult.docTableItems;
      }

      setMainData?.('currentDocument', {
        ...currentDocument,
        docTableItems,
      });

      showMessage('Перенесено в документ', 'success', setMainData);
      onClose();
    } catch (error: any) {
      setApplyError(error?.message || 'Произошла ошибка');
    } finally {
      setApplying(false);
    }
  };

  if (!open) return null;

  const hasSelection =
    rows.some((row) => (Number(row.transferQty) || 0) > 0) ||
    columnRows.some((row) => (Number(row.transferQty) || 0) > 0);

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>Выбор инструментов на складе</h3>
        <p className={styles.subtitle}>
          Инструменты с остатком и колонны. Сама колонна на складе не хранится — собирается из состава.
        </p>

        <div className={styles.body}>
          {loading && <div className={styles.empty}>Загрузка…</div>}
          {!loading && loadError && <div className={styles.error}>{loadError}</div>}
          {!loading && !loadError && sortedRows.length === 0 && columnRows.length === 0 && (
            <div className={styles.empty}>На складе нет инструментов с остатком</div>
          )}
          {!loading && !loadError && sortedRows.length > 0 && (
            <>
              <div className={styles.sectionTitle}>Остаток на складе</div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.colName}>Наименование</th>
                    <th className={styles.colNum}>Тариф</th>
                    <th className={styles.colNum}>Остаток</th>
                    <th className={styles.colQty}>К выдаче</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row) => (
                    <tr key={row.analiticId}>
                      <td className={styles.colName}>{nameOf(row.analiticId)}</td>
                      <td className={styles.colNum}>{numberValue(Number(row.hourlyTariff) || 0)} сум</td>
                      <td className={styles.colNum}>{row.remainQty}</td>
                      <td className={styles.colQty}>
                        <input
                          type="text"
                          inputMode="decimal"
                          className={styles.qtyInput}
                          value={row.transferQty || ''}
                          onChange={(e) => handleTransferQtyChange(row.analiticId, e.target.value)}
                          onKeyDown={handleQtyKeyDown}
                          onFocus={handleQtyFocus}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {!loading && !loadError && columnRows.length > 0 && (
            <>
              <div className={styles.sectionTitle}>Колонны</div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.colName}>Наименование</th>
                    <th className={styles.colNum}>Тариф</th>
                    <th className={styles.colNum}>Собирается</th>
                    <th className={styles.colQty}>К выдаче</th>
                  </tr>
                </thead>
                <tbody>
                  {columnRows.map((row) => (
                    <tr key={`column-${row.analiticId}`}>
                      <td className={styles.colName}>
                        {nameOf(row.analiticId)}
                        <div className={styles.hint}>{row.limitNote}</div>
                      </td>
                      <td className={styles.colNum}>{numberValue(Number(row.hourlyTariff) || 0)} сум</td>
                      <td className={styles.colNum}>{row.availableQty}</td>
                      <td className={styles.colQty}>
                        <input
                          type="text"
                          inputMode="decimal"
                          className={styles.qtyInput}
                          value={row.transferQty || ''}
                          disabled={row.availableQty <= 0}
                          onChange={(e) => handleColumnQtyChange(row.analiticId, e.target.value)}
                          onKeyDown={handleQtyKeyDown}
                          onFocus={handleQtyFocus}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {applyError && <div className={styles.error}>{applyError}</div>}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.btn}
            onClick={handleFillAll}
            disabled={loading || applying || rows.length === 0}
          >
            Заполнить всё
          </button>
          <div className={styles.footerEnd}>
            <button type="button" className={styles.btn} onClick={onClose} disabled={applying}>
              Отмена
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleApply}
              disabled={loading || applying || !hasSelection}
            >
              Перенести в документ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
