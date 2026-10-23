import { DocTableItem } from '@/app/interfaces/document.interface';

export type ToolArticleMeta = {
  article?: string;
  name?: string;
};

type ToolSortFields = Pick<
  DocTableItem,
  'analiticId' | 'billingRole' | 'assemblyRowKey' | 'settlementDate'
>;

export type SortToolRowsOptions = {
  /** При одинаковом артикуле (разные партии возврата) — по дате выдачи. */
  tieBreakBySettlementDate?: boolean;
};

/** Число сразу после префикса: OP-0009 → 9. Без такого числа — в конец списка. */
export const articleSortRank = (article: string): number => {
  const match = article.match(/^[A-Za-z]+-(\d+)/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return parseInt(match[1], 10);
};

export const compareToolsByArticle = (a: ToolArticleMeta, b: ToolArticleMeta): number => {
  const rankA = articleSortRank(a.article || '');
  const rankB = articleSortRank(b.article || '');
  if (rankA !== rankB) return rankA - rankB;
  const articleCmp = (a.article || '').localeCompare(b.article || '', 'en');
  if (articleCmp !== 0) return articleCmp;
  return (a.name || '').localeCompare(b.name || '', 'uz');
};

const settlementSortKey = (ms?: number | null) => {
  const n = Number(ms);
  return Number.isFinite(n) && n > 0 ? n : Number.POSITIVE_INFINITY;
};

const isAssemblyMember = (item: ToolSortFields) =>
  (item.billingRole === 'COLUMN' || item.billingRole === 'COLUMN_COMPONENT') &&
  !!item.assemblyRowKey;

/**
 * Сортирует строки показа/печати по номеру артикула.
 * Колонна и её состав с одним assemblyRowKey остаются одним блоком:
 * блок идёт по артикулу колонны, внутри — сначала колонна, затем детали по артикулу.
 */
export function sortToolRowsByArticle<T>(
  rows: T[],
  getItem: (row: T) => ToolSortFields,
  lookup: (analiticId: number) => ToolArticleMeta,
  options?: SortToolRowsOptions,
): T[] {
  const compareItems = (a: ToolSortFields, b: ToolSortFields) => {
    const byArticle = compareToolsByArticle(lookup(a.analiticId), lookup(b.analiticId));
    if (byArticle !== 0) return byArticle;
    if (options?.tieBreakBySettlementDate) {
      const dateDiff = settlementSortKey(a.settlementDate) - settlementSortKey(b.settlementDate);
      if (dateDiff !== 0) return dateDiff;
    }
    return 0;
  };

  type Block = { rows: T[]; sortItem: ToolSortFields };
  const blocks: Block[] = [];
  const blockIndexByKey = new Map<string, number>();

  for (const row of rows) {
    const item = getItem(row);
    if (!isAssemblyMember(item) || !item.assemblyRowKey) {
      blocks.push({ rows: [row], sortItem: item });
      continue;
    }
    const existing = blockIndexByKey.get(item.assemblyRowKey);
    if (existing == null) {
      blockIndexByKey.set(item.assemblyRowKey, blocks.length);
      blocks.push({ rows: [row], sortItem: item });
    } else {
      blocks[existing].rows.push(row);
      if (item.billingRole === 'COLUMN') {
        blocks[existing].sortItem = item;
      }
    }
  }

  const sortedBlocks = [...blocks].sort((a, b) => compareItems(a.sortItem, b.sortItem));

  return sortedBlocks.flatMap((block) => {
    if (block.rows.length <= 1) return block.rows;
    const column: T[] = [];
    const components: T[] = [];
    const rest: T[] = [];
    for (const row of block.rows) {
      const role = getItem(row).billingRole;
      if (role === 'COLUMN') column.push(row);
      else if (role === 'COLUMN_COMPONENT') components.push(row);
      else rest.push(row);
    }
    components.sort((a, b) => compareItems(getItem(a), getItem(b)));
    return [...column, ...components, ...rest];
  });
}
