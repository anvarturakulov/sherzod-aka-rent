import { DocumentType } from '@/app/interfaces/document.interface';

export const DOC_TABLE_LABELS = {
  WORKER: 'Сотрудник',
  PARTNER: 'Поставщик',
  NAME: 'Наименование',
  ARTICLE: 'Артикул',
  BALANCE: 'Остаток',
  COUNT: 'Количество',
  PRICE: 'Цена',
  TOTAL: 'Сумма',
  RECEIVER: 'Получатель',
  RECEIVED_CASH: 'Полученные деньги',
  COMMENT: 'Комментарий',
  DELETE_PLACEHOLDER: '____'
} as const;

export const DOCUMENT_TYPE_CHECKS = {
  HAS_COMMENT: (contentName: string) => contentName === DocumentType.LeaveCash,
  HAS_WORKERS: (contentName: string) => contentName === DocumentType.LeaveCash || contentName === DocumentType.ZpCalculate,
  HAS_PARTNERS: (contentName: string) => contentName === DocumentType.LeaveCash
} as const;

export const TABLE_CONFIG = {
  SHOW_BALANCE: true,
  BALANCE_BUTTON_TEXT: '?'
} as const; 