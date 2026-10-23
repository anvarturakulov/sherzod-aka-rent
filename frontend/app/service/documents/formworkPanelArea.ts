import { DocTableItem, getReturnItems } from '@/app/interfaces/document.interface';
import { FormworkKind, ReferenceModel } from '@/app/interfaces/reference.interface';

const positiveMm = (value: unknown): number | null => {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
};

/** Количество: целое без дроби, иначе один знак как у сумм. */
export const formatReturnQty = (qty: number): string => {
  if (Number.isInteger(qty)) return String(qty);
  const rounded = Math.round(qty * 10) / 10;
  return String(rounded);
};

/** Площадь м² с двумя знаками и разделителем тысяч. */
export const formatPanelAreaM2 = (area: number): string => {
  const rounded = Math.round((area + Number.EPSILON) * 100) / 100;
  const [whole, fraction = '00'] = rounded.toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${grouped}.${fraction}`;
};

export type FormworkPanelTotals = {
  areaM2: number;
  /** Доход аренды по тем же строкам, что и площадь (`total` строки возврата). */
  rentTotal: number;
  /** Количество колонн в возврате (`billingRole = COLUMN`). */
  columnCount: number;
  /** Доход аренды по строкам колонн. */
  columnRentTotal: number;
  /** Доход возврата без опалубки с размером, колонн и их состава. */
  restRentTotal: number;
};

/**
 * Площадь и доход щитов опалубки (қалқон) в строках возврата.
 * Учитываются только PANEL с заданными шириной и высотой, не входящие в состав колонны.
 */
export function getFormworkPanelTotals(
  items: DocTableItem[] | undefined,
  references: ReferenceModel[] | undefined,
): FormworkPanelTotals {
  const byId = new Map<number, ReferenceModel>();
  for (const ref of references || []) {
    if (ref.id != null) byId.set(ref.id, ref);
  }

  let areaM2 = 0;
  let rentTotal = 0;
  let columnCount = 0;
  let columnRentTotal = 0;
  let restRentTotal = 0;
  for (const item of getReturnItems(items || [])) {
    const count = Number(item.count) || 0;
    const rowTotal = Number(item.total) || 0;
    if (item.billingRole === 'COLUMN') {
      if (count > 0) columnCount += count;
      columnRentTotal += rowTotal;
      continue;
    }
    if (item.billingRole === 'COLUMN_COMPONENT') continue;

    const ref = byId.get(item.analiticId);
    const width = positiveMm(ref?.refValues?.width);
    const height = positiveMm(ref?.refValues?.height);
    const isSizedPanel =
      ref?.refValues?.formworkKind === FormworkKind.PANEL &&
      width != null &&
      height != null &&
      count > 0;
    if (isSizedPanel) {
      areaM2 += ((height * width) / 1_000_000) * count;
      rentTotal += rowTotal;
      continue;
    }
    restRentTotal += rowTotal;
  }
  return { areaM2, rentTotal, columnCount, columnRentTotal, restRentTotal };
}
