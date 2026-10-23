import {
  DocumentModel,
  ReceiveToolsPreviewRow,
  getBrakItems,
  getReturnItems,
  getSaleItems,
  getTovarItems,
} from '@/app/interfaces/document.interface';
import { buildReceiveToolsReturnRow, getReceiveToolsReturnDateTime } from '@/app/service/documents/receiveToolsRent';
import { showMessage } from '../common/showMessage';

export const FILL_RECEIVE_TOOLS_PARTY_CONFIRM =
  'Таблицы приёма, брака и продажи будут заменены остатком выбранной передачи. Строки продажи товара сохранятся. Продолжить?';

const roundQty = (n: number) => Math.round(n * 10000) / 10000;

const hasReplaceableRows = (docTableItems: DocumentModel['docTableItems']) => {
  const items = docTableItems || [];
  return (
    getReturnItems(items).some((item) => Number(item.analiticId) > 0) ||
    getBrakItems(items).some((item) => Number(item.analiticId) > 0) ||
    getSaleItems(items).some((item) => Number(item.analiticId) > 0)
  );
};

export interface ReceiveToolsPartyOption {
  sourceTransferDocId: number;
  transferDocNumber: string;
  transferDocComment: string;
  settlementDate: number;
  lineCount: number;
  remainQty: number;
}

const isColumnComponent = (row: ReceiveToolsPreviewRow) =>
  row.billingRole === 'COLUMN_COMPONENT';

export const groupReceiveToolsPreviewByTransfer = (
  rows: ReceiveToolsPreviewRow[],
): ReceiveToolsPartyOption[] => {
  const map = new Map<number, ReceiveToolsPartyOption>();

  for (const row of rows) {
    const id = Number(row.sourceTransferDocId);
    if (!id) continue;

    const counted = !isColumnComponent(row);
    const qty = counted ? Number(row.count) || 0 : 0;
    const existing = map.get(id);
    if (!existing) {
      map.set(id, {
        sourceTransferDocId: id,
        transferDocNumber: row.transferDocNumber || String(id),
        transferDocComment: (row.transferDocComment || '').trim(),
        settlementDate: Number(row.settlementDate) || 0,
        lineCount: counted ? 1 : 0,
        remainQty: qty,
      });
      continue;
    }

    if (counted) {
      existing.lineCount += 1;
      existing.remainQty = roundQty(existing.remainQty + qty);
    }
    if (!existing.transferDocComment && row.transferDocComment) {
      existing.transferDocComment = row.transferDocComment.trim();
    }
    const date = Number(row.settlementDate) || 0;
    if (date > 0 && (existing.settlementDate === 0 || date < existing.settlementDate)) {
      existing.settlementDate = date;
    }
  }

  return [...map.values()]
    .map((party) => {
      if (party.lineCount > 0) return party;
      const fallbackRows = rows.filter(
        (row) => Number(row.sourceTransferDocId) === party.sourceTransferDocId,
      );
      return {
        ...party,
        lineCount: fallbackRows.length,
        remainQty: roundQty(
          fallbackRows.reduce((sum, row) => sum + (Number(row.count) || 0), 0),
        ),
      };
    })
    .sort(
      (a, b) =>
        a.settlementDate - b.settlementDate ||
        a.sourceTransferDocId - b.sourceTransferDocId,
    );
};

export const fillReceiveToolsFromTransfer = (
  currentDocument: DocumentModel,
  setMainData: Function | undefined,
  previewRows: ReceiveToolsPreviewRow[],
  sourceTransferDocId: number,
): boolean => {
  const returnDateTime = getReceiveToolsReturnDateTime(currentDocument);
  const partyRows = previewRows.filter(
    (row) => Number(row.sourceTransferDocId) === Number(sourceTransferDocId),
  );

  if (!partyRows.length) {
    showMessage('У выбранной передачи нет открытого остатка', 'error', setMainData);
    return false;
  }

  if (
    hasReplaceableRows(currentDocument.docTableItems) &&
    !window.confirm(FILL_RECEIVE_TOOLS_PARTY_CONFIRM)
  ) {
    return false;
  }

  const normalizedReturnRows = partyRows.map((row) =>
    buildReceiveToolsReturnRow(row, Number(row.count) || 0, returnDateTime),
  );
  const tovarItems = getTovarItems(currentDocument.docTableItems || []);

  setMainData?.('currentDocument', {
    ...currentDocument,
    docTableItems: [...normalizedReturnRows, ...tovarItems],
  });
  return true;
};

export const getTotalRentFromReturnRows = (items: DocumentModel['docTableItems']) =>
  getReturnItems(items || []).reduce((s, r) => s + (Number(r.total) || 0), 0);
