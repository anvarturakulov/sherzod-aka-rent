import { DocTableItem, TransferToolsPreviewRow } from '@/app/interfaces/document.interface';

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface SaleEquipmentPickerRow {
  analiticId: number;
  /** Остаток на складе, только для справки. */
  stockQty: number;
  saleQty: number;
  price: number;
}

export const buildSaleEquipmentPickerRows = (
  previewRows: TransferToolsPreviewRow[],
): SaleEquipmentPickerRow[] =>
  previewRows
    .map((row) => ({
      analiticId: row.analiticId,
      stockQty: Number(row.count) || 0,
      saleQty: 0,
      price: 0,
    }))
    .filter((row) => row.stockQty > 0);

export const mergeSaleEquipmentPickerSelections = (
  docTableItems: DocTableItem[],
  selections: SaleEquipmentPickerRow[],
): { docTableItems: DocTableItem[] } | { error: string } => {
  const toApply = selections.filter((row) => (Number(row.saleQty) || 0) > 0);
  if (!toApply.length) {
    return { error: 'Укажите количество хотя бы для одной строки' };
  }
  if (toApply.some((row) => !(Number(row.price) > 0))) {
    return { error: 'Укажите цену' };
  }

  let items = [...docTableItems];
  for (const selection of toApply) {
    const addQty = round2(Number(selection.saleQty) || 0);
    const price = round2(Number(selection.price) || 0);
    const existingIndex = items.findIndex((item) => item.analiticId === selection.analiticId);
    if (existingIndex >= 0) {
      const existing = items[existingIndex];
      const newCount = round2((Number(existing.count) || 0) + addQty);
      items[existingIndex] = {
        ...existing,
        count: newCount,
        price,
        total: round2(newCount * price),
        costPrice: 0,
        costTotal: 0,
      };
    } else {
      items = [
        ...items,
        {
          analiticId: selection.analiticId,
          balance: 0,
          count: addQty,
          price,
          total: round2(addQty * price),
          costPrice: 0,
          costTotal: 0,
        },
      ];
    }
  }

  return { docTableItems: items };
};
