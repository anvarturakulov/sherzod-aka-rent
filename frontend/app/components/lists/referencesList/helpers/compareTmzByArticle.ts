import { ReferenceModel } from '@/app/interfaces/reference.interface';

/** Число сразу после префикса: OP-0009 → 9. Без такого числа — в конец списка. */
export function tmzArticleNumberRank(article?: string | null): number {
  const match = (article ?? '').trim().match(/^[A-Za-z]+-(\d+)/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const num = parseInt(match[1], 10);
  return Number.isFinite(num) ? num : Number.MAX_SAFE_INTEGER;
}

function compareName(a: ReferenceModel, b: ReferenceModel): number {
  return (a.name || '').localeCompare(b.name || '', 'ru');
}

/**
 * Сортировка соседних строк ТМЗ: папки выше элементов (по имени).
 * Элементы — по номеру артикула, затем по строке артикула, затем по имени.
 */
export function compareTmzByArticleNumber(a: ReferenceModel, b: ReferenceModel): number {
  if (a.isFolder && !b.isFolder) return -1;
  if (!a.isFolder && b.isFolder) return 1;
  if (a.isFolder && b.isFolder) return compareName(a, b);

  const rankA = tmzArticleNumberRank(a.article);
  const rankB = tmzArticleNumberRank(b.article);
  if (rankA !== rankB) return rankA - rankB;

  const articleCmp = (a.article || '').localeCompare(b.article || '', 'en');
  if (articleCmp !== 0) return articleCmp;

  return compareName(a, b);
}
