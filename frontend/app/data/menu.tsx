import { DocumentType } from "../interfaces/document.interface";
import { ReportType } from "../interfaces/report.interface";
import {ServiceType, GateType } from "../interfaces/general.interface";
import { MenuItem } from "../interfaces/menu.interface";
import { TypeReference } from "../interfaces/reference.interface";

/**
 * Декларативная конфигурация структуры меню
 * Содержит метаданные: описания, роли по умолчанию, порядок и иерархию
 * Список доступных элементов берется из registry (backend)
 */

export const MenuData:Array<MenuItem> = [
    {
        title: 'Основные показатели',
        titleText: 'Сводные данные',
        isOpened: true,
        subMenu: []
    },
    {
        title: 'КПП',
        titleText: 'Журнал КПП',
        isOpened: false,
        subMenu: [
            { 
                title: GateType.Income,
                description: 'Въезжающие машины',
                type: 'gate-income',
                active: false,
            },
            { 
                title: GateType.Outcome,
                description: 'Выезжающие машины',
                type: 'gate-outcome',
                active: false,
            },
            { 
                title: DocumentType.GateIncome, 
                description:'Накладная на въезд',
                type: 'document', 
                active: false,
            },
        ],
        // subGroups: [
        //     {
        //         title: 'Накладные',
        //         items: [
        //             { 
        //                 title: DocumentType.GateIncome, 
        //                 description:'Накладная для входа',
        //                 type: 'document', 
        //                 active: false,
        //             },
        //         ]
        //     }
        // ]
    },
    {
        title: 'Документы',
        titleText: 'Список ежедневных операций',
        isOpened: false,
        subMenu: [],
        subGroups: [
            {
                title: 'Все документы',
                items: [
                    { 
                        title: 'ALL_DOCUMENTS' as any, 
                        description: 'Все документы',
                        type: 'document', 
                        active: false,
                    }
                ]
            },
            {
                title: 'Инструменты (аренда)',
                items: [
                    
                    {
                        title: DocumentType.TransferToolsToClient,
                        description: 'Выдача',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: DocumentType.ReceiveToolsFromClient,
                        description: 'Возврат',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: DocumentType.SaleEquipment,
                        description: 'Реализация оборудования',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: DocumentType.OrderToolsToClient,
                        description: 'Заказ',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: DocumentType.TransferSubleaseToolsToClient,
                        description: 'Выдача субаренды',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: DocumentType.ReceiveSubleaseToolsFromClient,
                        description: 'Возврат субаренды',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: 'rental-contracts' as any,
                        description: 'Договоры аренды',
                        type: 'rental-contracts',
                        active: false,
                    },
                    {
                        title: DocumentType.ComeTools,
                        description: 'Приход инструмента',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: DocumentType.MoveTools,
                        description: 'Перемещение инструмента',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: DocumentType.LeaveTools,
                        description: 'Расход инструмента',
                        type: 'document',
                        active: false,
                    },
                    
                ]
            },
            {
                title: 'Продажа',
                items: [
                { 
                    title: DocumentType.SaleProd, 
                    description:'Продажа продукции',
                    type: 'document', 
                    active: false,
                },
                { 
                    title: DocumentType.SaleMaterial, 
                    description:'Продажа сырья',
                    type: 'document', 
                    active: false,
                },
                
                
            ]
            },
            {
                title: 'Готовая продукция',
                items: [
                        { 
                            title: DocumentType.ComeProduct, 
                            description:'Приход продукции',
                            type: 'document', 
                            active: false,
                        },
                        { 
                            title: DocumentType.LeaveProd, 
                            description:'Расход продукции',
                            type: 'document', 
                            active: false,
                        },
                    ]
            },
            {
                title: 'Сырьё',
                items: [
                    { 
                        title: DocumentType.ComeMaterial, 
                        description:'Приход сырья',
                        type: 'document', 
                        active: false,
                    },
                    { 
                        title: DocumentType.MoveMaterial, 
                        description:'Перемещение сырья',
                        type: 'document', 
                        active: false,
                    },
                    { 
                        title: DocumentType.LeaveMaterial, 
                        description:'Расход сырья',
                        type: 'document', 
                        active: false,
                    },
                    { 
                        title: DocumentType.LeaveOnlyOneMaterial, 
                        description:'Расход сырья (1 материал)',
                        type: 'document', 
                        active: false,
                    },
                ]
            },
            {
                title: 'Товары',
                items: [
                    {
                        title: DocumentType.ComeTovar,
                        description: 'Приход товара',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: DocumentType.LeaveTovar,
                        description: 'Расход товара',
                        type: 'document',
                        active: false,
                    },
                    { 
                        title: DocumentType.SaleTovar, 
                        description:'Продажа товара',
                        type: 'document', 
                        active: false,
                    },
                ]
            },
            
            {
                title: 'Основные средства',
                items: [
                    {
                        title: DocumentType.ComeOS,
                        description: 'Приход основного средства',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: DocumentType.MoveOS,
                        description: 'Перемещение основного средства',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: DocumentType.LeaveOS,
                        description: 'Расход основного средства',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: DocumentType.SaleOS,
                        description: 'Продажа основного средства',
                        type: 'document',
                        active: false,
                    },
                    {
                        title: DocumentType.AmortizasiyaOS,
                        description: 'Амортизация ОС',
                        type: 'document',
                        active: false,
                    },
                ]
            },
            {
                title: 'Полуфабрикаты',
                items: [
                        { 
                            title: DocumentType.ComeHalfstuff, description:'Приход полуфабриката',
                            type: 'document', active: false,
                        },
                        { 
                            title: DocumentType.LeaveHalfstuff, description:'Расход полуфабриката',
                            type: 'document', active: false,
                        },
                        { 
                            title: DocumentType.MoveHalfstuff, description:'Перемещение полуфабриката',
                            type: 'document', active: false,
                        }
                    ]
            },
            
            {
                title: 'Финансы',
                items: [
                    { 
                        title: DocumentType.ComeCashFromClients, 
                        description:'Приход денег',
                        type: 'document', 
                        active: false,
                    },
                    { 
                        title: DocumentType.MoveCash, 
                        description:'Перемещение денег',
                        type: 'document', 
                        active: false,
                    },
                    { 
                        title: DocumentType.LeaveCash, 
                        description:'Расход денег',
                        type: 'document', 
                        active: false,
                    },
                    
                ]
            },
            {
                title: 'Прочее',
                items: [
            { 
                title: DocumentType.ZpCalculate, 
                description:'Расчёт зарплаты',
                type: 'document', 
                active: false,
            },
            {
                title: DocumentType.ServicesFromPartners, 
                description:'Полученные услуги',
                type: 'document', 
                active: false,
            },
            {
                title: DocumentType.ServicesToClients,
                description:'Оказанные услуги',
                type: 'document',
                active: false,
            },
            { 
                title: DocumentType.TakeProfit, 
                description:'Распределение прибыли',
                type: 'document', 
                active: false,
            },
                ]
            }
        ]
    },
    {
        title: 'Справочники',
        titleText: 'Наименования показателей',
        isOpened: false,
        subMenu: [
            { 
                title: TypeReference.TMZ, 
                description:'Товарно-материальные ценности', 
                type: 'reference', 
                active: false,
            },
            {
                title: TypeReference.TMZ_SHORT_NAME,
                description: 'Краткие наименования (ТМЦ)',
                type: 'reference',
                active: false,
            },
            {
                title: TypeReference.TMZ_SIZE,
                description: 'Размеры (ТМЦ)',
                type: 'reference',
                active: false,
            },
            {
                title: TypeReference.TMZ_COLOR,
                description: 'Цвета (ТМЦ)',
                type: 'reference',
                active: false,
            },
            {
                title: TypeReference.TMZ_TEXTURE,
                description: 'Текстуры (ТМЦ)',
                type: 'reference',
                active: false,
            },
            {
                title: TypeReference.TMZ_MANUFACTURE,
                description: 'Производители (ТМЦ)',
                type: 'reference',
                active: false,
            },
            {
                title: TypeReference.TMZ_UNIT,
                description: 'Единицы измерения (ТМЦ)',
                type: 'reference',
                active: false,
            },
            { 
                title: TypeReference.STORAGES, 
                description:'Цехи и склады',
                type: 'reference', 
                active: false,
            },
            { 
                title: TypeReference.PARTNERS, 
                description:'Контрагенты', 
                type: 'reference', 
                active: false,
            },
            { 
                title: TypeReference.WORKERS, 
                description:'Сотрудники',
                type: 'reference', 
                active: false,
            },
            {
                title: TypeReference.DELIVERERS,
                description: 'Доставщики',
                type: 'reference',
                active: false,
            },
            {
                title: TypeReference.WORKS,
                description:'Виды работ',
                type: 'reference',
                active: false,
            },
            {
                title: TypeReference.COMMON_WORKS,
                description: 'Общие работы',
                type: 'reference',
                active: false,
            },
            { 
                title: TypeReference.CHARGES, 
                description:'Затраты',
                type: 'reference', 
                active: false,
            },
            {
                title: TypeReference.SERVICES,
                description:'Услуги',
                type: 'reference',
                active: false,
            },
            { 
                title: TypeReference.CARS, 
                description:'Автомобили',
                type: 'reference', 
                active: false,
            },

            { 
                title: TypeReference.APARTMENTS, 
                description:'Квартиры',
                type: 'reference', 
                active: false,
            },

        ]
    },
    {
        title: 'Отчёты',
        titleText: 'Отчёты о деятельности',
        isOpened: false,
        subMenu: [
            { 
                title: ReportType.MatOborot, 
                description:'Движение ТМЦ',
                type: 'report', 
                active: false,
            },
            { 
                title: ReportType.OsOborot, 
                description:'Движение основных средств',
                type: 'report', 
                active: false,
            },
            { 
                title: ReportType.Oborotka, 
                description:'Общий оборот',
                type: 'report', 
                active: false,
            },
            { 
                title: ReportType.Personal, 
                description:'Зарплата сотрудников',
                type: 'report', 
                active: false,
            },
            { 
                title: ReportType.MediatorPersonal, 
                description:'Зарплата посредников',
                type: 'report', 
                active: false,
            },
            {
                title: ReportType.DelivererPersonal,
                description: 'Расчёт доставщиков',
                type: 'report',
                active: false,
            },
            { 
                title: ReportType.AktSverka, 
                description:'Акт сверки',
                type: 'report', 
                active: false,
            },
            
        ]
    },
    {
        title: 'Программа',
        titleText: 'Настройки программы',
        isOpened: false,
        subMenu: [
            { 
                title: ServiceType.DeleteDocs, 
                description:'Удаление документов', 
                type: 'servis', 
                active: false, 
            },
            { 
                title: ServiceType.Users, 
                description:'Пользователи', 
                type: 'servis', 
                active: false, 
            },
            { 
                title: ServiceType.Enterprises, 
                description:'Предприятия', 
                type: 'servis', 
                active: false, 
            },
            { 
                title: ServiceType.Options, 
                description:'Настройки программы', 
                type: 'servis', 
                active: false, 
            },
            { 
                title: ServiceType.PricingPolicy, 
                description:'Ценовая политика', 
                type: 'servis', 
                active: false, 
            },
        ]
    },
    {
        title: 'Производство мебели',
        titleText: 'Заявки и работы',
        isOpened: false,
        subMenu: [
            {
                title: 'furniture-orders' as any,
                description: 'Все заявки',
                type: 'furniture-orders',
                active: false,
            },
            {
                title: 'furniture-my-works' as any,
                description: 'Мои работы (цех)',
                type: 'furniture-my-works',
                active: false,
            },
            {
                title: 'furniture-production-board' as any,
                description: 'Доска работ (цеха)',
                type: 'furniture-production-board',
                active: false,
            },
            {
                title: 'furniture-stage-board' as any,
                description: 'Доска заявок (этапы)',
                type: 'furniture-stage-board',
                active: false,
            },
            {
                title: 'furniture-contracts' as any,
                description: 'Договоры с клиентами',
                type: 'furniture-contracts',
                active: false,
            },
            {
                title: 'furniture-cutting-balances' as any,
                description: 'Остатки раскроя',
                type: 'furniture-cutting-balances',
                active: false,
            },
            {
                title: 'furniture-work-time-report' as any,
                description: 'Отчёт по рабочему времени',
                type: 'furniture-work-time-report',
                active: false,
            },
        ]
    }
]