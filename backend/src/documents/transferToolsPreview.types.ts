export interface TransferToolsPreviewRow {
  analiticId: number;
  count: number;
  balance: number;
  costPrice: number;
  costTotal: number;
  price: number;
  total: number;
  /** Дневной тариф аренды за 1 штуку (периодика firstPrice или thirdPrice по типу тарифа). */
  hourlyTariff: number;
}

export interface TransferColumnPartPreview {
  analiticId: number;
  normQty: number;
  remain: number;
  costPrice: number;
}

export interface TransferColumnPreview {
  analiticId: number;
  hourlyTariff: number;
  parts: TransferColumnPartPreview[];
}
