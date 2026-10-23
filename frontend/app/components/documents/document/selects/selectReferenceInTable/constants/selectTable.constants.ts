import { TypeTMZ } from '@/app/interfaces/reference.interface';

export const SELECT_TABLE_LABELS = {
  DEFAULT_OPTION: 'Выберите',
  NOT_SELECTED: 'Не выбрано'
} as const;

export const FILTER_CONDITIONS = {
  BY_TYPE_TMZ: (item: any) => item.refValues?.typeTMZ === TypeTMZ.MATERIAL,
  NOT_DELETED: (item: any) => !item.refValues?.markToDeleted
} as const;

export const DEFAULT_OPTION_DATA = {
  value: 'Не выбрано',
  label: 'Выберите',
  dataType: null,
  dataId: null
} as const; 