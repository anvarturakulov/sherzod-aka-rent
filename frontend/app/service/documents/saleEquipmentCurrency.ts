import { DocTableItem } from '@/app/interfaces/document.interface';

/** Отдельное слово «сум» или «сўм». «сумма» не считается. */
const SOM_WORD = /(^|[^\p{L}\p{N}])(сум|сўм)(?=$|[^\p{L}\p{N}])/iu;

export const isSaleEquipmentSomByComment = (
  comment?: string | null,
): boolean => Boolean(comment && SOM_WORD.test(comment));

export type SaleEquipmentCurrencyTotals = {
  usd: number;
  som: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export const splitSaleEquipmentTotals = (
  items: DocTableItem[],
  commentsById: Record<number, string | undefined>,
): SaleEquipmentCurrencyTotals => {
  let usd = 0;
  let som = 0;

  for (const item of items) {
    const total = Number(item.total) || 0;
    if (isSaleEquipmentSomByComment(commentsById[item.analiticId])) {
      som += total;
    } else {
      usd += total;
    }
  }

  return { usd: round2(usd), som: round2(som) };
};
