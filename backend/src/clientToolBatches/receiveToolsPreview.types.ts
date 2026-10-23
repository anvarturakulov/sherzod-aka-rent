export interface ReceiveToolsPreviewRow {
  analiticId: number;
  count: number;
  price: number;
  total: number;
  costPrice: number;
  costTotal: number;
  balance: number;
  hourlyTariff: number;
  rentSum: number;
  sourceTransferDocId: number;
  settlementDate: number;
  transferDocNumber: string;
  transferDocComment?: string;
  deliverySum?: number;
  delivererId?: number | null;
  deliveryChargedOnTransfer?: boolean;
  tableType: "return";
  batchId: number;
  billingRole: "PLAIN" | "COLUMN" | "COLUMN_COMPONENT";
  assemblyBatchId?: number | null;
  normQty?: number | null;
}
