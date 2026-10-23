import { TypeReference } from '@/app/interfaces/reference.interface';

export function getInlineReferenceModalTitle(
  typeReference: TypeReference,
  isEdit = false,
): string {
  if (isEdit) {
    switch (typeReference) {
      case TypeReference.PARTNERS:
        return 'Редактирование партнёра';
      case TypeReference.WORKERS:
        return 'Редактирование сотрудника';
      case TypeReference.DELIVERERS:
        return 'Редактирование доставщика';
      case TypeReference.CHARGES:
        return 'Редактирование расхода';
      case TypeReference.SERVICES:
        return 'Редактирование услуги';
      case TypeReference.MEDIATORS:
        return 'Редактирование посредника';
      case TypeReference.TMZ_SHORT_NAME:
        return 'Редактирование краткого наименования';
      case TypeReference.TMZ_SIZE:
        return 'Редактирование размера';
      case TypeReference.TMZ_COLOR:
        return 'Редактирование цвета';
      case TypeReference.TMZ_TEXTURE:
        return 'Редактирование текстуры';
      case TypeReference.TMZ_MANUFACTURE:
        return 'Редактирование производителя';
      case TypeReference.TMZ_UNIT:
        return 'Редактирование единицы измерения';
      default:
        return 'Редактирование';
    }
  }

  switch (typeReference) {
    case TypeReference.PARTNERS:
      return 'Новый партнёр';
    case TypeReference.WORKERS:
      return 'Новый сотрудник';
    case TypeReference.DELIVERERS:
      return 'Новый доставщик';
    case TypeReference.CHARGES:
      return 'Новый расход';
    case TypeReference.SERVICES:
      return 'Новая услуга';
    case TypeReference.TMZ_SHORT_NAME:
      return 'Новое краткое наименование';
    case TypeReference.TMZ_SIZE:
      return 'Новый размер';
    case TypeReference.TMZ_COLOR:
      return 'Новый цвет';
    case TypeReference.TMZ_TEXTURE:
      return 'Новая текстура';
    case TypeReference.TMZ_MANUFACTURE:
      return 'Новый производитель';
    case TypeReference.TMZ_UNIT:
      return 'Новая единица измерения';
    default:
      return 'Новый элемент';
  }
}
