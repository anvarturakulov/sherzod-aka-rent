'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DocTableItem, DocumentModel } from '@/app/interfaces/document.interface';
import { useAllReferences } from '@/app/components/lists/referencesList/hooks/useReferencesData';
import { numberValue } from '@/app/service/common/converters';
import { cleanNumericInput, isPartialDecimalValid } from '@/app/service/common/decimalInput';
import { fetchTransferToolsPreview } from '@/app/service/documents/fetchTransferToolsPreview';
import {
  buildSaleEquipmentPickerRows,
  mergeSaleEquipmentPickerSelections,
  SaleEquipmentPickerRow,
} from '@/app/service/documents/applySaleEquipmentPicker';
import { showMessage } from '@/app/service/common/showMessage';
import { compareToolsByArticle } from '@/app/service/documents/sortToolsByArticle';
import styles from '../transferToolsPickerModal/transferToolsPickerModal.module.css';

interface SaleEquipmentPickerModalProps {
  open: boolean;
  currentDocument: DocumentModel;
  allDocItems: DocTableItem[];
  token: string | undefined;
  enterpriseId: number | null | undefined;
  setMainData: Function | undefined;
  onClose: () => void;
}

const parseQty = (value: string): number => {
  if (value.trim() === '') return 0;
  const parsed = Number(cleanNumericInput(value));
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function SaleEquipmentPickerModal({
  open,
  currentDocument,
  allDocItems,
  token,
  enterpriseId,
  setMainData,
  onClose,
}: SaleEquipmentPickerModalProps) {
  const { data: references } = useAllReferences(token);
  const [rows, setRows] = useState<SaleEquipmentPickerRow[]>([]);
  const [qtyText, setQtyText] = useState<Record<number, string>>({});
  const [priceText, setPriceText] = useState<Record<number, string>>({});
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
      const preview = await fetchTransferToolsPreview(currentDocument, token, enterpriseId);
      setRows(buildSaleEquipmentPickerRows(preview));
      setQtyText({});
      setPriceText({});
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Ошибка загрузки';
      setLoadError(message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [currentDocument, enterpriseId, token]);

  useEffect(() => {
    if (open) {
      loadPreview();
    } else {
      setRows([]);
      setQtyText({});
      setPriceText({});
      setLoadError(null);
      setApplyError(null);
    }
  }, [open, loadPreview]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => compareByArticle(a.analiticId, b.analiticId));
  }, [rows, compareByArticle]);

  const setFieldText = (
    analiticId: number,
    field: 'qty' | 'price',
    value: string,
  ) => {
    if (!isPartialDecimalValid(value)) return;
    const parsed = parseQty(value);
    if (field === 'qty') {
      setQtyText((prev) => ({ ...prev, [analiticId]: value }));
      setRows((prev) =>
        prev.map((row) => (row.analiticId === analiticId ? { ...row, saleQty: parsed } : row)),
      );
      return;
    }
    setPriceText((prev) => ({ ...prev, [analiticId]: value }));
    setRows((prev) =>
      prev.map((row) => (row.analiticId === analiticId ? { ...row, price: parsed } : row)),
    );
  };

  const focusInput = (input: HTMLInputElement | null | undefined) => {
    if (!input || input.disabled) return;
    input.focus();
    input.select();
  };

  const moveColumnFocus = (current: HTMLInputElement, direction: 1 | -1) => {
    const dialog = current.closest(`.${styles.dialog}`);
    if (!dialog) return;
    const field = current.dataset.field;
    const inputs = Array.from(
      dialog.querySelectorAll<HTMLInputElement>(
        `input.${styles.qtyInput}[data-field="${field}"]:not(:disabled)`,
      ),
    );
    const index = inputs.indexOf(current);
    if (index < 0) return;
    focusInput(inputs[index + direction]);
  };

  const moveEnterFocus = (current: HTMLInputElement) => {
    const row = current.closest('tr');
    if (!row) return;
    if (current.dataset.field === 'qty') {
      focusInput(row.querySelector<HTMLInputElement>('input[data-field="price"]'));
      return;
    }
    const nextRow = row.nextElementSibling;
    if (!(nextRow instanceof HTMLTableRowElement)) return;
    focusInput(nextRow.querySelector<HTMLInputElement>('input[data-field="qty"]'));
  };

  const handleQtyKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      moveEnterFocus(event.currentTarget);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    moveColumnFocus(event.currentTarget, event.key === 'ArrowUp' ? -1 : 1);
  };

  const handleQtyFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  };

  const handleApply = () => {
    setApplying(true);
    setApplyError(null);
    try {
      const result = mergeSaleEquipmentPickerSelections(allDocItems, rows);
      if ('error' in result) {
        setApplyError(result.error);
        return;
      }

      setMainData?.('currentDocument', {
        ...currentDocument,
        docTableItems: result.docTableItems,
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

  const hasSelection = rows.some((row) => (Number(row.saleQty) || 0) > 0);

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>Выбор оборудования на складе</h3>
        <p className={styles.subtitle}>
          Инструменты с остатком. Количество не ограничивается остатком. Для каждой выбранной строки укажите цену.
        </p>

        <div className={styles.body}>
          {loading && <div className={styles.empty}>Загрузка…</div>}
          {!loading && loadError && <div className={styles.error}>{loadError}</div>}
          {!loading && !loadError && sortedRows.length === 0 && (
            <div className={styles.empty}>На складе нет инструментов с остатком</div>
          )}
          {!loading && !loadError && sortedRows.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colName}>Наименование</th>
                  <th className={styles.colNum}>Остаток</th>
                  <th className={styles.colQty}>Количество</th>
                  <th className={styles.colQty}>Цена</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr key={row.analiticId}>
                    <td className={styles.colName}>{nameOf(row.analiticId)}</td>
                    <td className={styles.colNum}>{numberValue(row.stockQty)}</td>
                    <td className={styles.colQty}>
                      <input
                        type="text"
                        inputMode="decimal"
                        className={styles.qtyInput}
                        data-field="qty"
                        value={qtyText[row.analiticId] ?? ''}
                        onChange={(e) => setFieldText(row.analiticId, 'qty', e.target.value)}
                        onKeyDown={handleQtyKeyDown}
                        onFocus={handleQtyFocus}
                      />
                    </td>
                    <td className={styles.colQty}>
                      <input
                        type="text"
                        inputMode="decimal"
                        className={styles.qtyInput}
                        data-field="price"
                        value={priceText[row.analiticId] ?? ''}
                        onChange={(e) => setFieldText(row.analiticId, 'price', e.target.value)}
                        onKeyDown={handleQtyKeyDown}
                        onFocus={handleQtyFocus}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {applyError && <div className={styles.error}>{applyError}</div>}
        </div>

        <div className={styles.footer}>
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
