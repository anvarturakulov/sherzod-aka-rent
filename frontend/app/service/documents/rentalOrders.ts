import { DocumentType } from '@/app/interfaces/document.interface';

export interface ReadyRentalOrderLine {
  toolId: number;
  toolName: string;
  qty: number;
}

export interface ReadyRentalOrder {
  id: number;
  clientId: number;
  clientName: string;
  warehouseId: number;
  lines: ReadyRentalOrderLine[];
}

export interface ReadyRentalOrdersPayload {
  enoughForAll: boolean;
  orders: ReadyRentalOrder[];
}

export const emptyReadyRentalOrders = (): ReadyRentalOrdersPayload => ({
  enoughForAll: true,
  orders: [],
});

export const isRentalToolsContent = (contentName?: string | null): boolean =>
  contentName === DocumentType.OrderToolsToClient ||
  contentName === DocumentType.TransferToolsToClient ||
  contentName === DocumentType.ReceiveToolsFromClient;

export const buildReadyRentalOrdersHeaderText = (
  payload?: ReadyRentalOrdersPayload | null,
): string => {
  const orders = payload?.orders || [];
  if (!orders.length) return '';
  if (orders.length === 1) {
    return `Заказ №${orders[0].id} можно закрыть`;
  }
  if (payload?.enoughForAll) {
    return `Можно закрыть заказов: ${orders.length}`;
  }
  return `Можно закрыть по отдельности: ${orders.length}`;
};

export const buildReadyRentalOrdersSummary = (
  payload?: ReadyRentalOrdersPayload | null,
): { title: string; note: string } => {
  const orders = payload?.orders || [];
  if (!orders.length) {
    return { title: '', note: '' };
  }
  if (orders.length === 1) {
    return {
      title: 'На складе появился инструмент',
      note: `Заказ №${orders[0].id} можно закрыть полностью.`,
    };
  }
  if (payload?.enoughForAll) {
    return {
      title: 'На складе появился инструмент',
      note: `Можно закрыть заказов: ${orders.length}.`,
    };
  }
  return {
    title: 'На складе появился инструмент',
    note: 'Заказы можно закрывать по отдельности. На все сразу инструмента не хватает.',
  };
};
