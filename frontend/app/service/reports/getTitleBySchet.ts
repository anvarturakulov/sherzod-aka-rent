import { Schet } from '@/app/interfaces/report.interface';

export const getTitleBySchet = (schet: Schet): string => {
  switch (schet) {
    case Schet.S10:
      return 'Сырьё'
    case Schet.S21:
      return 'Полуфабрикаты'
    case Schet.S28:
      return 'Готовая продукция'
    default :
      return ''
  }
}
