import {
  DocTableItem,
  DocumentModel,
  TransferColumnPreview,
  TransferToolsPreviewRow,
} from '@/app/interfaces/document.interface';
import {
  buildTransferToolsRow,
  enrichTransferToolsRow,
  recalcTransferToolsRowTotals,
} from '@/app/service/documents/buildTransferToolsRow';

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface TransferPickerSelectionRow extends TransferToolsPreviewRow {
  remainQty: number;
  transferQty: number;
}

export const getDocAllocatedQty = (
  allItems: DocTableItem[],
  analiticId: number,
): number =>
  round2(
    allItems
      .filter((item) => item.analiticId === analiticId)
      .reduce((sum, item) => sum + (Number(item.count) || 0), 0),
  );

export const getTransferPickerRemainQty = (
  previewRow: Pick<TransferToolsPreviewRow, 'analiticId' | 'count'>,
  allItems: DocTableItem[],
): number => {
  const stockRemain = Number(previewRow.count) || 0;
  const allocated = getDocAllocatedQty(allItems, previewRow.analiticId);
  return Math.max(0, round2(stockRemain - allocated));
};

export const buildTransferPickerRowsFromPreview = (
  previewRows: TransferToolsPreviewRow[],
  allDocItems: DocTableItem[],
): TransferPickerSelectionRow[] =>
  previewRows
    .map((row) => {
      const remainQty = getTransferPickerRemainQty(row, allDocItems);
      return { ...row, remainQty, transferQty: 0 };
    })
    .filter((row) => row.remainQty > 0);

export const mergeTransferPickerSelectionsIntoDocument = async (
  currentDocument: DocumentModel,
  selections: TransferPickerSelectionRow[],
  token: string | undefined,
  enterpriseId: number | null | undefined,
): Promise<{ docTableItems: DocTableItem[]; addedCount: number } | { error: string }> => {
  const toApply = selections.filter((row) => (Number(row.transferQty) || 0) > 0);
  if (!toApply.length) {
    return { error: 'Укажите количество хотя бы для одной строки' };
  }

  for (const row of toApply) {
    const transferQty = Number(row.transferQty) || 0;
    if (transferQty > row.remainQty + 0.0001) {
      return { error: 'Количество не может превышать остаток' };
    }
  }

  const documentDate = Number(currentDocument?.date) || Date.now();
  const rentTariffType = currentDocument?.docValues?.rentTariffType;
  let docTableItems = [...(currentDocument.docTableItems || [])];
  let addedCount = 0;

  for (const selection of toApply) {
    const transferQty = Number(selection.transferQty) || 0;
    const existingIndex = docTableItems.findIndex(
      (item) =>
        item.analiticId === selection.analiticId &&
        item.billingRole !== 'COLUMN' &&
        item.billingRole !== 'COLUMN_COMPONENT',
    );

    const selectionTariff = Number(selection.hourlyTariff) || 0;

    if (existingIndex >= 0) {
      const existing = docTableItems[existingIndex];
      const newCount = round2((Number(existing.count) || 0) + transferQty);
      const withCost = {
        ...existing,
        costPrice: Number(selection.costPrice) || Number(existing.costPrice) || 0,
        hourlyTariff: selectionTariff || Number(existing.hourlyTariff) || 0,
      };
      const recalced = recalcTransferToolsRowTotals(withCost, newCount);
      docTableItems[existingIndex] = await enrichTransferToolsRow(
        recalced,
        documentDate,
        token,
        enterpriseId,
        selectionTariff,
        rentTariffType,
      );
    } else {
      const base = buildTransferToolsRow({
        analiticId: selection.analiticId,
        count: transferQty,
        costPrice: Number(selection.costPrice) || 0,
        hourlyTariff: selectionTariff,
        balance: Number(selection.balance) || 0,
      });
      const enriched = await enrichTransferToolsRow(
        base,
        documentDate,
        token,
        enterpriseId,
        selectionTariff,
        rentTariffType,
      );
      docTableItems = [...docTableItems, enriched];
      addedCount += 1;
    }
  }

  return { docTableItems, addedCount };
};

const roundCount = (n: number) => Math.round(n * 10000) / 10000;

export interface ColumnPickerRow {
  analiticId: number;
  hourlyTariff: number;
  availableQty: number;
  limitNote: string;
  transferQty: number;
  parts: TransferColumnPreview['parts'];
}

export const columnAvailability = (
  column: TransferColumnPreview,
  allocatedByTool: Map<number, number>,
  nameOf: (id: number) => string,
): { availableQty: number; limitNote: string } => {
  let availableQty = Number.POSITIVE_INFINITY;
  let limitNote = '';
  for (const part of column.parts) {
    const norm = Number(part.normQty) || 0;
    if (norm <= 0) {
      return { availableQty: 0, limitNote: 'Норма детали не задана' };
    }
    const free = Math.max(0, (Number(part.remain) || 0) - (allocatedByTool.get(part.analiticId) || 0));
    const whole = Math.floor((free + 0.0001) / norm);
    if (whole < availableQty) {
      availableQty = whole;
      const needNext = roundCount((whole + 1) * norm);
      limitNote = `${nameOf(part.analiticId)}: ${roundCount(free)} бор, кейинги учун ${needNext} керак`;
    }
  }
  if (!Number.isFinite(availableQty)) {
    return { availableQty: 0, limitNote: 'Состав пуст' };
  }
  return { availableQty, limitNote };
};

export const mergeColumnSelectionsIntoDocument = (
  docTableItems: DocTableItem[],
  columns: ColumnPickerRow[],
): { docTableItems: DocTableItem[]; addedCount: number } | { error: string } => {
  const toApply = columns.filter((row) => (Number(row.transferQty) || 0) > 0);
  let items = [...docTableItems];
  let addedCount = 0;

  for (const column of toApply) {
    const addQty = Number(column.transferQty) || 0;
    if (addQty > column.availableQty + 0.0001) {
      return { error: 'Колонн больше, чем можно собрать из остатка деталей' };
    }
    const existing = items.find(
      (item) => item.analiticId === column.analiticId && item.billingRole === 'COLUMN',
    );
    const assemblyRowKey = existing?.assemblyRowKey || crypto.randomUUID();
    const nextCount = round2((Number(existing?.count) || 0) + addQty);
    const unitCost = round2(
      column.parts.reduce(
        (sum, part) => sum + (Number(part.costPrice) || 0) * (Number(part.normQty) || 0),
        0,
      ),
    );
    const columnCostTotal = round2(unitCost * nextCount);

    const columnRow: DocTableItem = {
      ...(existing || {
        analiticId: column.analiticId,
        balance: 0,
        price: unitCost,
        costPrice: unitCost,
      }),
      analiticId: column.analiticId,
      count: nextCount,
      balance: 0,
      price: unitCost,
      costPrice: unitCost,
      total: columnCostTotal,
      costTotal: columnCostTotal,
      hourlyTariff: Number(column.hourlyTariff) || 0,
      dailyRent: round2((Number(column.hourlyTariff) || 0) * nextCount),
      billingRole: 'COLUMN',
      assemblyRowKey,
    };

    items = items.filter(
      (item) =>
        !(
          item.assemblyRowKey === assemblyRowKey &&
          (item.billingRole === 'COLUMN' || item.billingRole === 'COLUMN_COMPONENT')
        ),
    );
    items.push(columnRow);
    if (!existing) addedCount += 1;

    for (const part of column.parts) {
      const count = roundCount(nextCount * (Number(part.normQty) || 0));
      const costPrice = Number(part.costPrice) || 0;
      const costTotal = round2(costPrice * count);
      items.push({
        analiticId: part.analiticId,
        count,
        balance: Number(part.remain) || 0,
        price: costPrice,
        total: costTotal,
        costPrice,
        costTotal,
        hourlyTariff: 0,
        dailyRent: 0,
        billingRole: 'COLUMN_COMPONENT',
        assemblyRowKey,
        normQty: Number(part.normQty) || 0,
      });
      addedCount += existing ? 0 : 1;
    }
  }

  return { docTableItems: items, addedCount };
};
