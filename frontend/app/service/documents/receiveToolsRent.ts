import {
  DocTableItem,
  getBrakItems,
  getReturnItems,
  getSaleItems,
  getTovarItems,
  ReceiveToolsPreviewRow,
} from '@/app/interfaces/document.interface';
import { rentCalendarDays } from '@/app/utils/appTime';

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Минимум дней аренды: тот же календарный день, что и отправка, даёт 0. */
export const MIN_RENT_DAYS = 0;

export function clampRentDays(days: number): number {
  return round2(Math.max(MIN_RENT_DAYS, days));
}

export function getReceiveToolsReturnDateTime(document: {
  date?: number;
  docValues?: { returnDateTime?: number };
}): number {
  return (
    Number(document?.date) ||
    Number(document?.docValues?.returnDateTime) ||
    0
  );
}

export function getDaysFromSettlement(
  item: DocTableItem,
  returnDateTime: number,
): number | null {
  const settlementDate = Number(item.settlementDate) || 0;
  if (settlementDate > 0 && returnDateTime > 0) {
    return rentCalendarDays(settlementDate, returnDateTime);
  }
  return null;
}

/** Число дней аренды. Поле в базе по-прежнему rentHours. */
export function getReceiveToolsRentDays(
  item: DocTableItem,
  returnDateTime: number,
): number | null {
  if (item.rentHours != null && item.rentHours !== undefined && !Number.isNaN(Number(item.rentHours))) {
    return clampRentDays(Number(item.rentHours));
  }

  const fromDates = getDaysFromSettlement(item, returnDateTime);
  if (fromDates !== null) {
    return fromDates;
  }

  const dailyTariff = Number(item.hourlyTariff) || 0;
  const count = Number(item.count) || 0;
  const rentSum = Number(item.rentSum) || 0;
  if (dailyTariff > 0 && count > 0) {
    return clampRentDays(rentSum / (dailyTariff * count));
  }

  return null;
}

export function recalcReceiveToolsReturnRow(
  item: DocTableItem,
  returnDateTime?: number,
): DocTableItem {
  const days = clampRentDays(
    item.rentHours != null && item.rentHours !== undefined
      ? Number(item.rentHours) || 0
      : returnDateTime
        ? getDaysFromSettlement(item, returnDateTime) ?? 0
        : 0,
  );

  const count = Number(item.count) || 0;
  const tariff = Number(item.hourlyTariff) || 0;
  const partnerTariff = Number(item.partnerHourlyTariff) || 0;
  const price = Number(item.price) || 0;
  const costPrice = Number(item.costPrice) || 0;
  const rentSum = round2(days * tariff * count);
  const partnerRentSum = round2(days * partnerTariff * count);
  const total = round2(rentSum - price);
  const costTotal = round2(costPrice * count);

  return {
    ...item,
    rentHours: days,
    rentSum,
    partnerRentSum,
    total,
    costTotal,
  };
}

export function buildReceiveToolsReturnRow(
  source: DocTableItem | ReceiveToolsPreviewRow,
  count: number,
  returnDateTime: number,
  options?: { preservePrice?: number },
): DocTableItem {
  const settlementDate = Number(source.settlementDate) || 0;
  const days =
    getDaysFromSettlement({ settlementDate } as DocTableItem, returnDateTime) ??
    getReceiveToolsRentDays(
      { ...source, settlementDate, count } as DocTableItem,
      returnDateTime,
    ) ??
    0;

  const costPrice = Number(source.costPrice) || 0;

  return recalcReceiveToolsReturnRow(
    {
      analiticId: source.analiticId,
      count,
      price: options?.preservePrice ?? 0,
      total: 0,
      costPrice,
      costTotal: round2(costPrice * count),
      balance: 0,
      hourlyTariff: Number(source.hourlyTariff) || 0,
      partnerHourlyTariff: Number((source as any).partnerHourlyTariff) || 0,
      rentHours: days,
      settlementDate,
      sourceTransferDocId: source.sourceTransferDocId,
      sourceBatchId: 'batchId' in source ? source.batchId : source.sourceBatchId,
      billingRole: source.billingRole,
      assemblyRowKey:
        source.billingRole === 'COLUMN' || source.billingRole === 'COLUMN_COMPONENT'
          ? String(
              ('assemblyBatchId' in source && source.assemblyBatchId) ||
                ('batchId' in source && source.billingRole === 'COLUMN' ? source.batchId : '') ||
                ('assemblyRowKey' in source ? source.assemblyRowKey : '') ||
                '',
            ) || undefined
          : undefined,
      normQty: source.normQty,
      tableType: 'return',
    },
    returnDateTime,
  );
}

export function normalizeReceiveToolsReturnRow(
  item: DocTableItem,
  returnDateTime: number,
): DocTableItem {
  return buildReceiveToolsReturnRow(item, Number(item.count) || 0, returnDateTime);
}

export function recalcReceiveToolsReturnTable(
  docTableItems: DocTableItem[] | undefined,
  returnDateTime: number,
): DocTableItem[] {
  if (!docTableItems?.length) {
    return docTableItems || [];
  }

  const recalcedReturn = getReturnItems(docTableItems).map((item) =>
    buildReceiveToolsReturnRow(item, Number(item.count) || 0, returnDateTime, {
      preservePrice: Number(item.price) || 0,
    }),
  );

  return [
    ...recalcedReturn,
    ...getBrakItems(docTableItems),
    ...getSaleItems(docTableItems),
    ...getTovarItems(docTableItems),
  ];
}

export function formatRentHours(hours: number | null): string {
  if (hours === null) return '—';
  return hours.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export const isReceiveToolsReturnRow = (item: DocTableItem): boolean =>
  item.tableType === 'return' || !item.tableType;
