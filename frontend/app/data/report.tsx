import { DashboardReportItem } from "../interfaces/report.interface";

/** Новые inform-отчёты: показываются ролям, у которых уже есть доступ к любому inform-отчёту */
export const INFORM_REPORTS_AUTO_GRANT: readonly string[] = [
    'FurnitureOrders',
    'ContractFulfillment',
    'ClientsContractsWork',
    'RentalUnfulfilledOrders',
    'RentalOpenTransfers',
    // 'RentalExpectedIncome',
];

export const DashboardReportData:Array<DashboardReportItem> = [
    
    {
        title: 'Общая сводка',
        code: 'SvodBYCompany',
        id: 15,
    },
    
    {
        id: 2,
        title: 'Баланс',
        code: 'DebitorKreditor',
    },
    {
        title: 'Движение денег — по предприятию',
        code: 'Financial',
        id: 1,
    },
    {
        id: 4,
        title: 'Касса, таблица',
        code: 'Cash',
    },
    
    {
        id: 7,
        title: 'Касса, карточка',
        code: 'Section-buxgalter',
    },
    {
        id: 31,
        title: 'Карточка счёта',
        code: 'ACCOUNTOPERATIONS',
    },
    {
        title: 'Кассовые операции',
        code: 'CASHOPERATIONS',
        id: 1
    },
    {
        id: 3,
        title: 'Расчёт прибыли',
        code: 'FoydaByProduction',
    },

    {
        id: 36,
        title: 'Расчёт прибыли (по заказам)',
        code: 'FoydaByOrder',
    },

    {
        id: 10,
        title: 'Склад',
        code: 'Sklad',    
    },
    {
        id: 22,
        title: 'Нормы материалов',
        code: 'TmcMaterialNorms',
    },  
    {
        id: 27,
        title: 'Отчет по предприятиям (межпредприятийные операции)',
        code: 'EnterpriseIntercompanyReport',
    },
    {
        id: 29,
        title: 'Расход материалов по цехам',
        code: 'MaterialByDepartment',
    },
    {
        id: 30,
        title: 'Производство: факт и норма (материалы)',
        code: 'ProductionMaterialVariance',
    },
    {
        id: 32,
        title: 'Планирование материалов',
        code: 'MaterialPlanning',
    },
    {
        id: 33,
        title: 'Приход материалов (артикул)',
        code: 'ComeMaterialTmzByArticle',
    },
    {
        id: 34,
        title: 'Акт сверки',
        code: 'AktSverka',
    },
    {
        id: 35,
        title: 'Поставщик — товар и материалы',
        code: 'SupplierGoods',
    },
    {
        id: 37,
        title: 'Основной склад — остатки ТМЦ',
        code: 'TmzMainWarehouseBalance',
    },
    {
        id: 38,
        title: 'Заявки (документы)',
        code: 'FurnitureOrders',
    },
    {
        id: 39,
        title: 'Аренда — ожидаемый доход',
        code: 'RentalExpectedIncome',
    },
    {
        id: 40,
        title: 'Инструменты — текущий остаток',
        code: 'ToolsCurrentBalance',
    },
    {
        id: 41,
        title: 'Чистая прибыль аренды',
        code: 'RentalNetProfit',
    },
    {
        id: 42,
        title: 'Субаренда — по партнёру',
        code: 'SubleasePartnerMargin',
    },
    {
        id: 43,
        title: 'Субаренда — ожидаемый доход',
        code: 'SubleaseExpectedIncome',
    },
    {
        id: 44,
        title: 'Исполнение договоров',
        code: 'ContractFulfillment',
    },
    {
        id: 45,
        title: 'Клиенты и договоры',
        code: 'ClientsContractsWork',
    },
    {
        id: 46,
        title: 'Аренда — невыполненные заказы',
        code: 'RentalUnfulfilledOrders',
    },
    {
        id: 47,
        title: 'Аренда — незакрытые накладные',
        code: 'RentalOpenTransfers',
    },
]