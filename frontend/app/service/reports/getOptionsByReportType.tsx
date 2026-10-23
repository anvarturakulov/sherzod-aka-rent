import { ReportType, Schet } from '@/app/interfaces/report.interface'
import { TypeReference } from '../../interfaces/reference.interface'


interface Result {
    label: string,
    typeReference: TypeReference
}

export const getOptionsByReportType = (reportType:string, schet: Schet):Result => {
    switch (reportType) {
        case ReportType.Personal:
            return {label:'Сотрудник', typeReference: TypeReference.WORKERS}
        case ReportType.MediatorPersonal:
            return {label:'Посредник', typeReference: TypeReference.PARTNERS}
        case ReportType.DelivererPersonal:
            return {label:'Доставщик', typeReference: TypeReference.DELIVERERS}
        case ReportType.MatOborot:
            if (schet === Schet.S12) {
                return { label: 'Клиент', typeReference: TypeReference.PARTNERS }
            }
            return { label: 'Подразделение или цех', typeReference: TypeReference.STORAGES }
        case ReportType.OsOborot:
            return { label: 'Подразделение или цех', typeReference: TypeReference.STORAGES }
        case ReportType.Clients:
            return { label: 'Подразделение', typeReference: TypeReference.STORAGES }
        case ReportType.AktSverka:
            return { label: 'Контрагент', typeReference: TypeReference.PARTNERS }
        case ReportType.Oborotka:
            switch(schet) {
                case Schet.S10:
                    return { label: 'Сырьё', typeReference: TypeReference.STORAGES }    
                case Schet.S20:
                    return { label: 'Затраты', typeReference: TypeReference.STORAGES }
                case Schet.S23:
                    return { label: '23 счет', typeReference: TypeReference.STORAGES }
                case Schet.S28:
                    return { label: 'Готовая продукция', typeReference: TypeReference.STORAGES }    
                case Schet.S40:
                    return { label: 'Клиенты', typeReference: TypeReference.PARTNERS }
                case Schet.S41:
                    return { label: 'Внутренние предприятия', typeReference: TypeReference.PARTNERS }
                case Schet.S60:
                    return { label: 'Контрагенты', typeReference: TypeReference.PARTNERS }
                case Schet.S50:
                    return { label: 'Касса', typeReference: TypeReference.STORAGES }
                case Schet.S66:
                    return { label: 'Учредители', typeReference: TypeReference.STORAGES }
                case Schet.S67:
                    return { label: 'Зарплата сотрудников', typeReference: TypeReference.WORKERS }
                case Schet.S65:
                    return { label: 'Бонус посредников', typeReference: TypeReference.PARTNERS }
                case Schet.S64:
                    return { label: 'Доставщики', typeReference: TypeReference.DELIVERERS }
                case Schet.S68:
                    return { label: 'Кошельки', typeReference: TypeReference.STORAGES }
                default:
                    return { label: 'Неизвестно', typeReference: TypeReference.STORAGES }
            }
        default:
            return { label: 'Предприятие', typeReference: TypeReference.PARTNERS }
    }
}
