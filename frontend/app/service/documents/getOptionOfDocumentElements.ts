import { DocumentType, OptionsForDocument } from "../../interfaces/document.interface";
import { TypeReference } from '../../interfaces/reference.interface';

export const getOptionOfDocumentElements = (documentType: string, documentDate?: number): OptionsForDocument => {

    let senderType = TypeReference.STORAGES, senderLabel = '', senderIsVisible = false
    let receiverType = TypeReference.STORAGES, receiverLabel = '', recieverIsVisible = false  
    let analiticType = TypeReference.STORAGES , analiticLabel = '', analiticIsVisible = false
    let productForChargeType = TypeReference.TMZ, productForChargeLabel = '', productForChargeIsVisible = false
    let finPersonIsVisible = false;
    let driverIsVisible = false;
    
    let currencyIsVisible = false;
    let usdIsVisible = false;
    let currencyLabel = 'Валюта курси';
    let usdLabel = 'Валюта жами';
    
    let cashFromPartnerLabel = '' , cashFromPartnerVisible = false;
    let tableIsVisible = false;
    let balansIsVisible = true;

    const startDate = 1735671599000;
    
    let countIsVisible = true;
    let countIsDisabled = false;

    let priceIsVisible = true;
    let priceIsDisabled = false;
    
    let totalIsVisible = true;
    let totalIsDisabled = false;

    let commentIsVisible = true
    let isDepartmentIsVisible = false;

    let carType = TypeReference.CARS, carLabel = 'Автомашина', carIsVisible = false;
    let senderPersonType = TypeReference.WORKERS, senderPersonLabel = 'Сотрудник-отправитель', senderPersonIsVisible = false;
    let materialResponsiblePersonType = TypeReference.WORKERS,
        materialResponsiblePersonLabel = 'Мат. жавобгар шахс',
        materialResponsiblePersonIsVisible = false;

    const documentsComeMaterial = [
        `${DocumentType.ComeMaterial}`,
    ]

    const documentsComeProduct = [
        `${DocumentType.ComeProduct}`,
    ]

    const documentsComeHalfstuff = [
        `${DocumentType.ComeHalfstuff}`,
    ]

    const documentsSaleProd = [
        `${DocumentType.SaleProd}`,
    ]

    const documentsSaleMaterial = [
        `${DocumentType.SaleMaterial}`,
    ]

    const documentsLeaveProd = [
        `${DocumentType.LeaveProd}`,
    ]

    const documentsLeaveMaterial = [
        `${DocumentType.LeaveMaterial}`,
    ]
    
    const documentsLeaveOnlyOneMaterial = [
        `${DocumentType.LeaveOnlyOneMaterial}`,
    ]

    const documentsLeaveHalfstuff = [
        `${DocumentType.LeaveHalfstuff}`,
    ]

    const documentsMoveProd = [
        `${DocumentType.MoveProd}`,
    ]

    const documentsMoveMaterial = [
        `${DocumentType.MoveMaterial}`,
    ]

    const documentsComeTools = [
        `${DocumentType.ComeTools}`,
    ]

    const documentsLeaveTools = [
        `${DocumentType.LeaveTools}`,
    ]

    const documentsReceiveToolsFromClient = [
        `${DocumentType.ReceiveToolsFromClient}`,
    ]

    const documentsMoveTools = [
        `${DocumentType.MoveTools}`,
    ]

    const documentsTransferToolsToClient = [
        `${DocumentType.TransferToolsToClient}`,
        `${DocumentType.OrderToolsToClient}`,
    ]

    const documentsSaleEquipment = [
        `${DocumentType.SaleEquipment}`,
    ]

    const documentsTransferSubleaseToolsToClient = [
        `${DocumentType.TransferSubleaseToolsToClient}`,
    ]

    const documentsReceiveSubleaseToolsFromClient = [
        `${DocumentType.ReceiveSubleaseToolsFromClient}`,
    ]

    const documentsComeTovar = [
        `${DocumentType.ComeTovar}`,
    ]

    const documentsLeaveTovar = [
        `${DocumentType.LeaveTovar}`,
    ]

    const documentsSaleTovar = [
        `${DocumentType.SaleTovar}`,
    ]

    const documentsComeOS = [
        `${DocumentType.ComeOS}`,
    ]

    const documentsLeaveOS = [
        `${DocumentType.LeaveOS}`,
    ]

    const documentsMoveOS = [
        `${DocumentType.MoveOS}`,
    ]

    const documentsSaleOS = [
        `${DocumentType.SaleOS}`,
    ]

    const documentsAmortizasiyaOS = [
        `${DocumentType.AmortizasiyaOS}`,
    ]

    const documentsMoveHalfstuff = [
        `${DocumentType.MoveHalfstuff}`,
    ]

    const documentsComeCashFromPartners = [
        `${DocumentType.ComeCashFromClients}`,
    ]

    const documentsMoveCash = [
        `${DocumentType.MoveCash}`,
    ]

    const documentsLeaveCash = [
        `${DocumentType.LeaveCash}`,
    ]

    const documentsZpCalculate = [
        `${DocumentType.ZpCalculate}`,
    ]

    const documentsTakeProfit = [
        `${DocumentType.TakeProfit}`,
    ]

    const ServicesFromPartners = [
        `${DocumentType.ServicesFromPartners}`,
    ]

    const ServicesToClients = [
        `${DocumentType.ServicesToClients}`,
    ]

    const documentsSaleHalfStuff = [
        `${DocumentType.SaleHalfStuff}`,
    ]

    const documentsComeCashFromClients = [
        `${DocumentType.ComeCashFromClients}`,
    ]

    const documentsGateIncome = [
        `${DocumentType.GateIncome}`,
    ]
    
    if (documentsGateIncome.includes(documentType)) {
        // Накладная для входа - простая форма только с полем машины
        senderType = TypeReference.STORAGES
        senderLabel = ''
        senderIsVisible = false
        
        receiverType = TypeReference.STORAGES
        receiverLabel = ''
        recieverIsVisible = false

        analiticType = TypeReference.STORAGES
        analiticLabel = ''
        analiticIsVisible = false

        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        tableIsVisible = false;
        commentIsVisible = true;
        
        // Поле машины обязательно для накладной входа
        carIsVisible = true;
        carLabel = 'Автомашина';
        carType = TypeReference.CARS;
    }
    
    if (documentsComeMaterial.includes(documentType)) {
        senderType = TypeReference.PARTNERS
        senderLabel = 'Поставщик'
        senderIsVisible = true
        
        receiverType = TypeReference.STORAGES
        receiverLabel = 'Кабул килувчи булим'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Товар моддий бойлик'
        analiticIsVisible = true

        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        analiticIsVisible = false;
        tableIsVisible = true;
        
        // Временно скрыто: поле машины поставщика
        carIsVisible = false;
        // carLabel = 'Таъминочти машинаси';
    }

    if (documentsComeTools.includes(documentType)) {
        senderType = TypeReference.PARTNERS
        senderLabel = 'Поставщик'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Кабул килувчи булим'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Инструмент'
        analiticIsVisible = true

        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        analiticIsVisible = false;
        tableIsVisible = true;
        carIsVisible = false;
    }

    if (documentsComeTovar.includes(documentType)) {
        senderType = TypeReference.PARTNERS
        senderLabel = 'Поставщик'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Принимающий склад'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Товар'
        analiticIsVisible = true

        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        analiticIsVisible = false;
        tableIsVisible = true;
        carIsVisible = false;
    }

    if (documentsComeOS.includes(documentType)) {
        senderType = TypeReference.PARTNERS
        senderLabel = 'Поставщик'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Кабул килувчи булим'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Основное средство'
        analiticIsVisible = true

        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        analiticIsVisible = false;
        tableIsVisible = true;

        carIsVisible = true;
        carLabel = 'Таъминочти машинаси';
    }

    if (documentsComeProduct.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Кабул килувчи булим'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Готовая продукция'
        analiticIsVisible = true

        balansIsVisible = false;
        commentIsVisible = true;

        priceIsVisible = false;
        totalIsVisible = true;
    }

    if (documentsComeHalfstuff.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Ишлаб чикарувчи булим'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Кабул килувчи булим'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Я.Т.М'
        analiticIsVisible = true;

        priceIsVisible = false;
        totalIsVisible = true;
        balansIsVisible = false;
    }

    if (documentsSaleProd.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.PARTNERS
        receiverLabel = 'Клиент'
        recieverIsVisible = true

        analiticType = TypeReference.STORAGES
        analiticLabel = 'Отдел-получатель денег'
        analiticIsVisible = false

        balansIsVisible = false;
        commentIsVisible = true;

        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        tableIsVisible = true;
    }

    if (documentsSaleMaterial.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отправитель'
        senderIsVisible = true

        receiverType = TypeReference.PARTNERS
        receiverLabel = 'Клиент'
        recieverIsVisible = true

        analiticType = TypeReference.STORAGES
        analiticLabel = 'Отдел-получатель денег'
        analiticIsVisible = false

        balansIsVisible = false;
        commentIsVisible = true;

        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        tableIsVisible = true;

        totalIsDisabled = true;
        priceIsDisabled = true;
    }

    if (documentsSaleTovar.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Склад-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.PARTNERS
        receiverLabel = 'Клиент'
        recieverIsVisible = true

        analiticType = TypeReference.STORAGES
        analiticLabel = 'Отдел-получатель денег'
        analiticIsVisible = false

        balansIsVisible = false;
        commentIsVisible = true;

        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        tableIsVisible = true;

        totalIsDisabled = true;
        priceIsDisabled = true;
    }

    if (documentsSaleOS.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отправитель'
        senderIsVisible = true

        receiverType = TypeReference.PARTNERS
        receiverLabel = 'Клиент'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Основное средство'
        analiticIsVisible = true

        totalIsDisabled = true;
        priceIsDisabled = true;
        tableIsVisible = true;
        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
    }

    if (documentsSaleHalfStuff.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отправитель'
        senderIsVisible = true

        receiverType = TypeReference.PARTNERS
        receiverLabel = 'Клиент'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'ЯТМ'
        analiticIsVisible = true

        totalIsDisabled = true;
        priceIsDisabled = false;
    }

    if (documentsLeaveProd.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.CHARGES
        receiverLabel = 'Вид расхода'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Готовая продукция'
        analiticIsVisible = false

        productForChargeType = TypeReference.TMZ
        productForChargeLabel = 'Расход на какую продукцию'
        productForChargeIsVisible = false

        balansIsVisible = false;
        commentIsVisible = true;

        // countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        tableIsVisible = true;
    }

    if (documentsLeaveMaterial.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Отдел-получатель расхода'
        recieverIsVisible = true

        analiticType = TypeReference.CHARGES
        analiticLabel = 'Вид расхода'
        analiticIsVisible = true

        productForChargeType = TypeReference.TMZ
        productForChargeLabel = 'Расход на какую продукцию'
        productForChargeIsVisible = false

        tableIsVisible = true

        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;

    }

    if (documentsLeaveTools.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Отдел-получатель расхода'
        recieverIsVisible = true

        analiticType = TypeReference.CHARGES
        analiticLabel = 'Вид расхода'
        analiticIsVisible = true

        productForChargeType = TypeReference.TMZ
        productForChargeLabel = 'Расход на какую продукцию'
        productForChargeIsVisible = false

        tableIsVisible = true

        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
    }

    if (documentsLeaveTovar.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Склад-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Отдел-получатель расхода'
        recieverIsVisible = true

        analiticType = TypeReference.CHARGES
        analiticLabel = 'Вид расхода'
        analiticIsVisible = true

        productForChargeType = TypeReference.TMZ
        productForChargeLabel = 'Расход на какую продукцию'
        productForChargeIsVisible = false

        tableIsVisible = true

        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
    }

    if (documentsLeaveOS.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Отдел-получатель расхода'
        recieverIsVisible = true

        analiticType = TypeReference.CHARGES
        analiticLabel = 'Вид расхода'
        analiticIsVisible = true

        productForChargeType = TypeReference.TMZ
        productForChargeLabel = 'Расход на какую продукцию'
        productForChargeIsVisible = false

        tableIsVisible = true
        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
    }

    if (documentsAmortizasiyaOS.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Склад (ОС)'
        senderIsVisible = true
        recieverIsVisible = false
        analiticIsVisible = false
        productForChargeIsVisible = false
        tableIsVisible = true
        balansIsVisible = true
        countIsVisible = false
        priceIsVisible = true
        totalIsVisible = true
        totalIsDisabled = true
    }
    
    if (documentsLeaveOnlyOneMaterial.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Отдел-получатель расхода'
        recieverIsVisible = true

        analiticType = TypeReference.CHARGES
        analiticLabel = 'Вид расхода'
        analiticIsVisible = true

        productForChargeType = TypeReference.TMZ
        productForChargeLabel = 'Списываемый материал'
        productForChargeIsVisible = true

        tableIsVisible = false

        balansIsVisible = false;
        countIsVisible = true;
        priceIsVisible = true;
        totalIsVisible = true;
        priceIsDisabled = true;
        totalIsDisabled = true;
    }

    if (documentsLeaveHalfstuff.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.CHARGES
        receiverLabel = 'Вид расхода'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Я.Т.М'
        analiticIsVisible = false

        productForChargeType = TypeReference.TMZ
        productForChargeLabel = 'Расход на какую продукцию'
        productForChargeIsVisible = true

        totalIsDisabled = true;
        priceIsDisabled = true;
        commentIsVisible = true;

        tableIsVisible = true;

        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
    }

    if (documentsMoveProd.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Кабул килувчи булим'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Готовая продукция'
        analiticIsVisible = true

        priceIsVisible = false;
        totalIsVisible = false;
    }

    if (documentsMoveMaterial.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Кабул килувчи булим'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Хом ашё'
        analiticIsVisible = true

        totalIsDisabled = true;
        priceIsDisabled = true;

        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        analiticIsVisible = false;
        tableIsVisible = true;
    }

    if (documentsMoveTools.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Кабул килувчи булим'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Инструмент'
        analiticIsVisible = true

        totalIsDisabled = true;
        priceIsDisabled = true;

        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        analiticIsVisible = false;
        tableIsVisible = true;
    }

    if (documentsTransferToolsToClient.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Склад-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.PARTNERS
        receiverLabel = 'Клиент'
        recieverIsVisible = true

        analiticType = TypeReference.STORAGES
        analiticLabel = 'Касса (аванс)'
        analiticIsVisible = false

        materialResponsiblePersonIsVisible =
            documentType === `${DocumentType.OrderToolsToClient}`;
        materialResponsiblePersonLabel = 'Мат. жавобгар шахс';
        materialResponsiblePersonType = TypeReference.WORKERS;

        totalIsDisabled = true;
        priceIsDisabled = true;
        balansIsVisible = true;
        commentIsVisible = true;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        tableIsVisible = true;
    }

    if (documentsSaleEquipment.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Склад-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.PARTNERS
        receiverLabel = 'Клиент'
        recieverIsVisible = true

        analiticIsVisible = false
        totalIsDisabled = true;
        priceIsDisabled = true;
        balansIsVisible = false;
        commentIsVisible = true;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        tableIsVisible = true;
    }

    if (documentsTransferSubleaseToolsToClient.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Склад партнёра'
        senderIsVisible = true

        receiverType = TypeReference.PARTNERS
        receiverLabel = 'Клиент'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = '-'
        analiticIsVisible = false

        totalIsDisabled = true;
        priceIsDisabled = true;
        balansIsVisible = false;
        commentIsVisible = true;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        tableIsVisible = true;
    }

    if (documentsReceiveToolsFromClient.includes(documentType)) {
        senderType = TypeReference.PARTNERS
        senderLabel = 'Клиент'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Принимающий склад'
        recieverIsVisible = true

        analiticType = TypeReference.STORAGES
        analiticLabel = 'Брак склад'
        analiticIsVisible = false

        productForChargeType = TypeReference.STORAGES
        productForChargeLabel = 'Карта (банк)'
        productForChargeIsVisible = false

        totalIsDisabled = true;
        priceIsDisabled = true;
        balansIsVisible = false;
        commentIsVisible = true;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        tableIsVisible = true;
    }

    if (documentsReceiveSubleaseToolsFromClient.includes(documentType)) {
        senderType = TypeReference.PARTNERS
        senderLabel = 'Клиент'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Склад партнёра'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = '-'
        analiticIsVisible = false

        totalIsDisabled = true;
        priceIsDisabled = true;
        balansIsVisible = false;
        commentIsVisible = true;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        tableIsVisible = true;
    }

    if (documentsMoveOS.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Кабул килувчи булим'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Основное средство'
        analiticIsVisible = true

        totalIsDisabled = true;
        priceIsDisabled = true;
        balansIsVisible = false;
        countIsVisible = false;
        priceIsVisible = false;
        totalIsVisible = false;
        analiticIsVisible = false;
        tableIsVisible = true;
    }

    if (documentsMoveHalfstuff.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Кабул килувчи булим'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = 'Я.Т.М'
        analiticIsVisible = true

        priceIsDisabled = true;
        totalIsDisabled = true;
        commentIsVisible = true;

    }

    if (documentsComeCashFromPartners.includes(documentType)) {
        senderType = TypeReference.PARTNERS
        senderLabel = 'Хамкор'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Кабул килувчи булим'
        recieverIsVisible = true

        analiticType = TypeReference.STORAGES
        analiticLabel = 'Иккинчи ташкилот'
        analiticIsVisible = false; // Будет условно показываться в ValuesSection на основе isOffice у receiver

        countIsVisible = false;
        priceIsVisible = false;
        balansIsVisible = false;
        commentIsVisible = true;
        isDepartmentIsVisible = true;

        currencyIsVisible = true;
        usdIsVisible = true;
    }

    if (documentsMoveCash.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Кабул килувчи булим'
        recieverIsVisible = true

        analiticType = TypeReference.TMZ
        analiticLabel = '-'
        analiticIsVisible = false

        countIsVisible = false;
        priceIsVisible = false;
        balansIsVisible = false;
        commentIsVisible = true;

        currencyIsVisible = true;
        usdIsVisible = true;
        
        

    }

    if (documentsLeaveCash.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Отдел-получатель расхода'
        recieverIsVisible = true

        analiticType = TypeReference.CHARGES
        analiticLabel = 'Вид расхода'
        analiticIsVisible = true

        productForChargeType = TypeReference.WORKERS
        productForChargeLabel = 'Жавобгар шахс'
        // Временно скрыто
        productForChargeIsVisible = false

        priceIsVisible = false;
        countIsVisible = false;
        balansIsVisible = false;
        commentIsVisible = true;
        finPersonIsVisible = false;

        currencyIsVisible = true;
        usdIsVisible = true;
    }

    if (documentsZpCalculate.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = '{fhf;fn ,ekbvb}'
        senderIsVisible = false

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Отдел-получатель расхода'
        recieverIsVisible = true

        analiticType = TypeReference.WORKERS
        analiticLabel = 'Сотрудник'
        analiticIsVisible = true;

        productForChargeType = TypeReference.TMZ
        productForChargeLabel = 'Расход на какую продукцию'
        productForChargeIsVisible = false

        priceIsVisible = false;
        countIsVisible = false;
        balansIsVisible = false;
        commentIsVisible = true;
    }

    if (documentsTakeProfit.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = '------'
        senderIsVisible = false

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Учредитель-получатель прибыли'
        recieverIsVisible = true

        analiticType = TypeReference.WORKERS
        analiticLabel = '-----'
        analiticIsVisible = false;

        priceIsVisible = false;
        countIsVisible = false;
        balansIsVisible = false;
    }

    if (ServicesFromPartners.includes(documentType)) {
        senderType = TypeReference.PARTNERS
        senderLabel = 'Предприятие'
        senderIsVisible = true

        receiverType = TypeReference.STORAGES
        receiverLabel = 'Отдел-получатель расхода'
        recieverIsVisible = true

        analiticType = TypeReference.CHARGES
        analiticLabel = 'Вид расхода'
        analiticIsVisible = true;

        productForChargeType = TypeReference.TMZ
        productForChargeLabel = 'Расход на какую продукцию'
        productForChargeIsVisible = false

        priceIsVisible = false;
        countIsVisible = false;
        balansIsVisible = false;
    }

    if (ServicesToClients.includes(documentType)) {
        senderType = TypeReference.STORAGES
        senderLabel = 'Отдел-отправитель'
        senderIsVisible = true

        receiverType = TypeReference.PARTNERS
        receiverLabel = 'Клиент'
        recieverIsVisible = true

        analiticType = TypeReference.SERVICES
        analiticLabel = 'Хизмат тури'
        analiticIsVisible = true;

        productForChargeType = TypeReference.TMZ
        productForChargeLabel = ''
        productForChargeIsVisible = false

        priceIsVisible = false;
        countIsVisible = false;
        balansIsVisible = false;
    }

    return {
        senderType,
        senderLabel,
        receiverType,
        receiverLabel,
        senderIsVisible,
        recieverIsVisible,
        analiticType,
        analiticLabel,
        analiticIsVisible,
        productForChargeType,
        productForChargeLabel,
        productForChargeIsVisible,
        cashFromPartnerLabel,
        cashFromPartnerVisible,
        tableIsVisible,
        countIsVisible,
        priceIsVisible,
        totalIsVisible,
        priceIsDisabled,
        totalIsDisabled,
        balansIsVisible,
        commentIsVisible,
        currencyIsVisible,       
        usdIsVisible,
        currencyLabel,
        usdLabel,
        finPersonIsVisible,
        driverIsVisible,
        senderPersonIsVisible,
        carIsVisible,
        carType,
        carLabel,
        senderPersonType,
        senderPersonLabel,
        materialResponsiblePersonIsVisible,
        materialResponsiblePersonType,
        materialResponsiblePersonLabel,
    }
}