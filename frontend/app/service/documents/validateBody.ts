import {
  DocumentModel,
  DocumentType,
  documentsWithTableItems,
  getIncomeItems,
  getReturnItems,
  getSaleItems,
  getTovarItems,
} from "../../interfaces/document.interface";
import { getReceiveToolsCopyRemainQty } from '@/app/service/documents/copyReceiveToolsFromReturn';

/** Строки таблицы с выбранным ТМЗ (без пустых placeholder). */
export const getFilledDocTableItems = (docTableItems: DocumentModel['docTableItems']) =>
  (docTableItems || []).filter((item) => Number(item.analiticId) > 0);

export const getValidateBodyError = (body: DocumentModel): string | null => {
  const { date, documentType, docTableItems } = body;
  const {
    analiticId,
    senderId,
    receiverId,
    total,
    count,
    orderId,
    workId,
  } = body.docValues || {};

  if (!date || date <= 0) {
    return 'Укажите дату документа';
  }
  if (!documentType || documentType === DocumentType.Error) {
    return 'Тип документа не определён';
  }

  if (documentType === DocumentType.GateIncome) {
    const { carId } = body.docValues || {};
    if (!carId || carId === 0) {
      return 'Выберите автомобиль';
    }
    return null;
  }

  if (documentType === DocumentType.ZpCalculate) {
    if (!receiverId || !analiticId || analiticId <= 0 || !total) {
      return 'Заполните получателя, сотрудника и сумму';
    }
    return null;
  }

  if (documentType === DocumentType.ServicesToClients) {
    if (!senderId || !receiverId || !analiticId || analiticId <= 0 || !total) {
      return 'Заполните отдел-отправитель, клиента, вид услуги и сумму';
    }
    return null;
  }

  if (documentType === DocumentType.AmortizasiyaOS) {
    if (!senderId) {
      return 'Выберите склад (ОС)';
    }
  } else if (!senderId || !receiverId) {
    return 'Выберите отправителя и получателя';
  }

  if (
    senderId === receiverId &&
    documentType !== DocumentType.LeaveMaterial &&
    documentType !== DocumentType.LeaveTools &&
    documentType !== DocumentType.LeaveTovar &&
    documentType !== DocumentType.LeaveOnlyOneMaterial &&
    documentType !== DocumentType.AmortizasiyaOS
  ) {
    return 'Получатель и отправитель не могут совпадать';
  }

  if (documentsWithTableItems.includes(documentType) && documentType !== DocumentType.SaleProd && documentType !== DocumentType.SaleMaterial && documentType !== DocumentType.SaleTovar && documentType !== DocumentType.TransferToolsToClient && documentType !== DocumentType.OrderToolsToClient && documentType !== DocumentType.SaleEquipment && documentType !== DocumentType.ReceiveToolsFromClient && documentType !== DocumentType.TransferSubleaseToolsToClient && documentType !== DocumentType.ReceiveSubleaseToolsFromClient) {
    const filledItems = getFilledDocTableItems(docTableItems);
    if (!filledItems.length) {
      return 'Добавьте в таблицу хотя бы одно основное средство';
    }
    for (const item of filledItems) {
      if (Number(item.count) <= 0) {
        return 'В таблице некорректное количество (должно быть больше 0)';
      }
      if (Number(item.price) <= 0) {
        return 'Укажите цену в таблице (для основного средства цена обязательна)';
      }
      if (Number(item.total) <= 0) {
        return 'В таблице некорректная сумма';
      }
    }
  }

  if (!documentsWithTableItems.includes(documentType)) {
    if (!total) {
      return 'Укажите сумму';
    }
  }

  if (documentType === DocumentType.LeaveOnlyOneMaterial) {
    const remainCount = Number(body.docValues?.remainCount || 0);
    const countValue = Number(count || 0);
    if (countValue > remainCount) {
      return `Количество не должно превышать остаток (${remainCount})`;
    }
    if (!body.docValues?.productForChargeId || body.docValues.productForChargeId <= 0) {
      return 'Выберите материал для расхода';
    }
    if (!orderId || orderId <= 0 || !workId || workId <= 0) {
      return 'Выберите заказ и работу';
    }
  }

  if (documentType === DocumentType.SaleEquipment) {
    const filled = getFilledDocTableItems(docTableItems);
    if (!filled.length) {
      return 'Добавьте оборудование в таблицу';
    }
    for (const item of filled) {
      if (Number(item.count) <= 0) {
        return 'В таблице некорректное количество';
      }
      if (Number(item.total) <= 0) {
        return 'Укажите цену и сумму в таблице';
      }
    }
    return null;
  }

  if (documentType === DocumentType.OrderToolsToClient) {
    const allFilled = getFilledDocTableItems(docTableItems);
    const toolItems = getIncomeItems(allFilled);
    if (!toolItems.length) {
      return 'Добавьте инструмент в таблицу';
    }
    for (const item of toolItems) {
      if (Number(item.count) <= 0) {
        return 'В таблице инструментов некорректное количество';
      }
    }
    return null;
  }

  if (documentType === DocumentType.TransferToolsToClient) {
    const allFilled = getFilledDocTableItems(docTableItems);
    const toolItems = getIncomeItems(allFilled);
    const saleItems = getSaleItems(allFilled);

    if (!toolItems.length && !saleItems.length) {
      return 'Добавьте в таблицу инструмент или товар';
    }

    if (toolItems.length > 0) {
      const settlementDate = Number(body.docValues?.settlementDate || 0);
      if (!settlementDate || settlementDate <= 0) {
        return 'Укажите дату расчёта';
      }
      for (const item of toolItems) {
        if (Number(item.count) <= 0) {
          return 'В таблице инструментов некорректное количество';
        }
        if (Number(item.costTotal) <= 0) {
          return 'В таблице инструментов не найдена себестоимость';
        }
      }
    }

    for (const item of saleItems) {
      if (Number(item.count) <= 0) {
        return 'В таблице товаров некорректное количество';
      }
      if (Number(item.total) <= 0) {
        return 'В таблице товаров не найдена сумма продажи';
      }
      if (Number(item.costTotal) <= 0) {
        return 'В таблице товаров не найдена себестоимость';
      }
    }

    const deliverySum = Number(body.docValues?.deliverySum || 0);
    if (deliverySum > 0 && !Number(body.docValues?.delivererId || 0)) {
      return 'Выберите доставщика для доставки';
    }
    return null;
  }

  if (documentType === DocumentType.ReceiveToolsFromClient) {
    const returnDateTime =
      Number(body.docValues?.returnDateTime) || Number(date);
    if (!returnDateTime || returnDateTime <= 0) {
      return 'Укажите дату и время возврата';
    }
    const hasRows = getFilledDocTableItems(docTableItems).length > 0;
    if (!hasRows) {
      return 'Заполните таблицу или нажмите «Заполнить»';
    }
    const allItems = docTableItems || [];
    for (const returnItem of getReturnItems(allItems)) {
      const rentSum = Number(returnItem.rentSum) || 0;
      const price = Number(returnItem.price) || 0;
      if (price < -0.0001 || price - rentSum > 0.0001) {
        return 'Скидка не должна превышать сумму аренды';
      }
      if (!returnItem.sourceTransferDocId || !returnItem.analiticId) continue;
      const remain = getReceiveToolsCopyRemainQty(returnItem, allItems);
      if (remain < -0.0001) {
        return 'Количество брака/продажи превышает количество возврата';
      }
    }
    const deliverySum = Number(body.docValues?.deliverySum || 0);
    if (deliverySum > 0 && !Number(body.docValues?.delivererId || 0)) {
      return 'Выберите доставщика для доставки';
    }
    for (const saleItem of getSaleItems(allItems)) {
      const price = Number(saleItem.price) || 0;
      const costPrice = Number(saleItem.costPrice) || 0;
      if (price < costPrice - 0.0001) {
        return 'Продажа клиенту: цена не должна быть ниже себестоимости';
      }
    }
    for (const tovarItem of getTovarItems(allItems)) {
      if (Number(tovarItem.count) <= 0) {
        return 'В таблице товаров некорректное количество';
      }
      if (Number(tovarItem.total) <= 0) {
        return 'В таблице товаров не найдена сумма продажи';
      }
      if (Number(tovarItem.costTotal) <= 0) {
        return 'В таблице товаров не найдена себестоимость';
      }
    }
    return null;
  }

  if (documentType === DocumentType.TransferSubleaseToolsToClient) {
    if (!senderId || !receiverId) {
      return 'Выберите склад партнёра и клиента';
    }
    if (!Number(body.docValues?.partnerId || 0)) {
      return 'В складе не указан партнёр';
    }
    const settlementDate = Number(body.docValues?.settlementDate || 0);
    if (!settlementDate || settlementDate <= 0) {
      return 'Укажите дату расчёта';
    }
    const toolItems = getFilledDocTableItems(docTableItems);
    if (!toolItems.length) {
      return 'Добавьте инструмент в таблицу';
    }
    for (const item of toolItems) {
      if (Number(item.count) <= 0) {
        return 'В таблице инструментов некорректное количество';
      }
    }
    return null;
  }

  if (documentType === DocumentType.ReceiveSubleaseToolsFromClient) {
    if (!senderId || !receiverId) {
      return 'Выберите клиента и склад партнёра';
    }
    if (!Number(body.docValues?.partnerId || 0)) {
      return 'В складе не указан партнёр';
    }
    const returnDateTime =
      Number(body.docValues?.returnDateTime) || Number(date);
    if (!returnDateTime || returnDateTime <= 0) {
      return 'Укажите дату и время возврата';
    }
    const hasRows = getFilledDocTableItems(docTableItems).length > 0;
    if (!hasRows) {
      return 'Заполните таблицу или нажмите «Заполнить»';
    }
    return null;
  }

  if (documentType === DocumentType.LeaveCash) {
    if (!senderId || !analiticId || analiticId <= 0 || !total || !receiverId) {
      return 'Заполните поля кассового документа';
    }
  }

  if (documentType === DocumentType.SaleMaterial) {
    if (!senderId || !receiverId) {
      return 'Выберите склад-отправитель и получателя';
    }
    const filledItems = getFilledDocTableItems(docTableItems);
    if (!filledItems.length) {
      return 'Добавьте в таблицу хотя бы одно сырьё';
    }
    for (const item of filledItems) {
      if (Number(item.count) <= 0) {
        return 'В таблице некорректное количество (должно быть больше 0)';
      }
      if (Number(item.total) <= 0) {
        return 'Укажите сумму продажи в таблице';
      }
    }
  }

  return null;
};

export const validateBody = (body: DocumentModel): Boolean =>
  getValidateBodyError(body) === null;
