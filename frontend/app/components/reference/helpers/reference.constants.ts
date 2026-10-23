import { TypePartners, TypeSECTION, TypeTMZ, CarType, ProductionType, PriceClass, TypeReference, TypeMediator } from '@/app/interfaces/reference.interface'

/** Текстовые поля shortName/size/color/unit/manufacture в карточке ТМЗ (для сверки с данными справочника) */
export const TMZ_CARD_SHOW_ATTRIBUTE_TEXT_FIELDS = false

/** Хамкорлар (CLIENTS/SUPPLIERS), ходимлар, харажатлар — общие справочники (enterpriseId = null) */
export const isSharedDirectoryReferenceType = (typeReference: TypeReference): boolean =>
  typeReference === TypeReference.PARTNERS ||
  typeReference === TypeReference.WORKERS ||
  typeReference === TypeReference.CHARGES ||
  typeReference === TypeReference.SERVICES

/** CLIENTS/SUPPLIERS PARTNERS, WORKERS, CHARGES — без фильтра по организации */
const isOrgFilterSkippedForReferenceType = (
  typeReference: TypeReference,
  partnerType?: string | TypePartners,
): boolean => {
  if (typeReference === TypeReference.WORKERS || typeReference === TypeReference.CHARGES || typeReference === TypeReference.SERVICES) {
    return true
  }
  if (typeReference === TypeReference.PARTNERS) {
    return (
      partnerType === TypePartners.CLIENTS ||
      partnerType === TypePartners.SUPPLIERS ||
      partnerType === 'CLIENTS' ||
      partnerType === 'SUPPLIERS'
    )
  }
  return false
}

/** В отчётах: не фильтровать общие справочники по выбранной организации (superKassir / global) */
export const shouldSkipOrgFilterInReportSelect = (
  typeReference: TypeReference,
  partnerType?: string,
): boolean => isOrgFilterSkippedForReferenceType(typeReference, partnerType)

/** В документах: показывать общие справочники с enterpriseId = null */
export const shouldAllowCommonReferenceInDocumentSelect = (
  typeReference: TypeReference,
  typePartners?: TypePartners,
): boolean => isOrgFilterSkippedForReferenceType(typeReference, typePartners)

export interface DataForSelect {
  name: string,
  title: string
}

export const typePartnersList: DataForSelect[] = [
  { name: '', title: 'Выберите тип партнёра' },
  { name: TypePartners.CLIENTS, title: 'Клиент' },
  { name: TypePartners.DEPARTMENTS, title: 'Внутреннее подразделение' },
  { name: TypePartners.SUPPLIERS, title: 'Поставщик' }
]

export const typeTMZList: DataForSelect[] = [
  { name: '', title: 'Выберите тип ТМЦ' },
  { name: TypeTMZ.PRODUCT, title: 'Готовая продукция' },
  { name: TypeTMZ.MATERIAL, title: 'Материал' },
  { name: TypeTMZ.HALFSTUFF, title: 'Полуфабрикат' },
  { name: TypeTMZ.OS, title: 'Основное средство' },
  { name: TypeTMZ.TOOLS, title: 'Инструмент (аренда)' },
  { name: TypeTMZ.TOVAR, title: 'Товар' },
]

export const typeSectionList: DataForSelect[] = [
  { name: '', title: 'Выберите тип раздела' },
  { name: TypeSECTION.COMMON, title: 'Общий раздел' },
  { name: TypeSECTION.PRODUCTION, title: 'Производственный цех' },
  { name: TypeSECTION.STORAGE, title: 'Склад' },
  { name: TypeSECTION.PARTNER_TOOLS, title: 'Субаренда (склад партнёра)' },
  { name: TypeSECTION.CASH, title: 'Наличные' },
  { name: TypeSECTION.BANK, title: 'Банк' },
  { name: TypeSECTION.PLASTIK, title: 'Пластик' },
  { name: TypeSECTION.FOUNDER, title: 'Учредитель' },
]

export const carTypeList: DataForSelect[] = [
  { name: '', title: 'Выберите тип автомобиля' },
  { name: CarType.VIP, title: 'VIP' },
  { name: CarType.OWN, title: 'Свой' },
  { name: CarType.STRANGER, title: 'Чужой' }
]

export const mediatorTypeList: DataForSelect[] = [
  { name: '', title: 'Выберите тип посредника' },
  { name: TypeMediator.DRIVER, title: 'Водитель' },
  { name: TypeMediator.MASTER, title: 'Мастер' }
]

export const productionTypeList: DataForSelect[] = [
  { name: ProductionType.OTHER, title: 'Прочие' },
  { name: ProductionType.PB_PLITA, title: 'ПБ Плита' },
  { name: ProductionType.PK_PLITA, title: 'ПК Плита' },
  { name: ProductionType.BETON, title: 'Бетон' }
]

export const priceClassList: DataForSelect[] = [
  { name: '', title: 'Класс цен' },
  { name: PriceClass.A, title: 'Класс A' },
  { name: PriceClass.B, title: 'Класс B' },
  { name: PriceClass.C, title: 'Класс C' },
]