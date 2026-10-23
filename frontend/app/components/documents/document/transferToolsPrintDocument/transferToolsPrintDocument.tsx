'use client';

import React, { forwardRef } from 'react';
import {
  DocumentModel,
  getIncomeItems,
  getSaleItems,
} from '@/app/interfaces/document.interface';
import { formatDisplayDateTime } from '@/app/utils/formatDisplayDate';
import { numberValue } from '@/app/service/common/converters';
import { PrintCopiesWithTearOff } from '../printCopies/printCopies';
import { sortToolRowsByArticle } from '@/app/service/documents/sortToolsByArticle';

const cellBorder = { border: '1.5px solid #000', padding: 6 } as const;
const cellCenter = { ...cellBorder, textAlign: 'center' as const };
const cellRight = { ...cellBorder, textAlign: 'right' as const };
const thCenter = { ...cellBorder, textAlign: 'center' as const };

export type TransferToolsPrintDocumentProps = {
  document: DocumentModel;
  clientName?: string;
  clientPhone?: string;
  contractBasis?: string;
  toolNames: Record<number, string>;
  toolArticles?: Record<number, string>;
  copyCount?: number;
  showClientGoodsSale?: boolean;
  showExtraCharge?: boolean;
  showPriceAndSum?: boolean;
};

const TransferToolsPrintDocument = forwardRef<HTMLDivElement, TransferToolsPrintDocumentProps>(
  (
    {
      document,
      clientName,
      clientPhone,
      contractBasis,
      toolNames,
      toolArticles = {},
      copyCount = 1,
      showClientGoodsSale = true,
      showExtraCharge = true,
      showPriceAndSum = true,
    },
    ref,
  ) => {
    const filled = (document.docTableItems || []).filter((i) => Number(i.analiticId) > 0);
    const toolItems = sortToolRowsByArticle(
      getIncomeItems(filled),
      (item) => item,
      (id) => ({ article: toolArticles[id] || '', name: toolNames[id] || '' }),
    );
    const saleItems = getSaleItems(filled);
    const deliverySum = Number(document.docValues?.deliverySum || 0);
    const defectCost = Number(document.docValues?.defectCost || 0);
    const saleTotal = saleItems.reduce((s, i) => s + (Number(i.total) || 0), 0);

    const totalCount = toolItems.reduce((s, i) => s + (Number(i.count) || 0), 0);
    const totalDailyRent = toolItems.reduce((s, i) => s + (Number(i.dailyRent) || 0), 0);
    const totalCost = toolItems.reduce((s, i) => s + (Number(i.costTotal) || 0), 0);

    const usdAmount = Number(document.docValues?.usd) || 0;
    const currency = Number(document.docValues?.currency) || 0;
    const usdInSum = usdAmount * currency;
    const nakdTotal = (Number(document.docValues?.initialPayment) || 0) + usdInSum;
    const plastic = Number(document.docValues?.cashFromPartner) || 0;
    const changeToClient = Number(document.docValues?.changeToClient) || 0;

    const paymentParts: string[] = [];
    if (nakdTotal > 0) {
      paymentParts.push(`Наличные: ${numberValue(nakdTotal)} сум`);
    }
    if (plastic > 0) {
      paymentParts.push(`Карта: ${numberValue(plastic)} сум`);
    }
    if (changeToClient > 0) {
      paymentParts.push(`Сдача: ${numberValue(changeToClient)} сум`);
    }

    const compact = copyCount >= 2;

    const molId = Number(document.docValues?.materialResponsiblePersonId) || 0;
    const molName = molId > 0 ? toolNames[molId] || '' : '';
    const topshirdimLine = molName
      ? `Сдал: _______________ ${molName}`
      : 'Сдал: _______________';

    const renderCopy = () => (
      <div
        style={{
          padding: compact ? 12 : 24,
          fontFamily: 'Arial, sans-serif',
          fontSize: compact ? 11 : 14,
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: compact ? 18 : 28,
            fontWeight: 700,
            margin: '0 0 12px',
          }}
        >
          Акт приёма-передачи инструмента
        </h2>
        {contractBasis?.trim() ? (
          <p style={{ textAlign: 'center' }}>Основание: {contractBasis.trim()}</p>
        ) : null}
        <p>Дата постановки на учёт: {formatDisplayDateTime(document.date)}</p>
        <p>Клиент: {clientName || '—'}</p>
        {clientPhone?.trim() ? <p>Телефон: {clientPhone.trim()}</p> : null}
        {document.docValues?.comment?.trim() ? (
          <p>Комментарий: {document.docValues.comment.trim()}</p>
        ) : null}
        <p>
          Суточная аренда: {numberValue(totalDailyRent)} сум
          {showExtraCharge && (
            <span style={{ marginLeft: 40 }}>
              Доставка: {numberValue(deliverySum)} сум
            </span>
          )}
          {defectCost > 0 && (
            <span style={{ marginLeft: 40 }}>
              Расходы по браку: {numberValue(defectCost)} сум
            </span>
          )}
        </p>
        {toolItems.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: compact ? 8 : 16 }}>
            <thead>
              <tr>
                <th style={thCenter}>№</th>
                <th style={thCenter}>Наименование</th>
                <th style={thCenter}>Количество</th>
                <th style={thCenter}>Суточный тариф</th>
                <th style={thCenter}>Суточная аренда</th>
                {showPriceAndSum && (
                  <>
                    <th style={thCenter}>Цена инструмента</th>
                    <th style={thCenter}>Стоимость выдаваемого инструмента</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {toolItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={cellBorder}>{idx + 1}</td>
                  <td style={cellBorder}>
                    {toolNames[item.analiticId] || item.analiticId}
                  </td>
                  <td style={cellCenter}>{item.count}</td>
                  <td style={cellRight}>
                    {numberValue(Number(item.hourlyTariff) || 0)}
                  </td>
                  <td style={cellRight}>
                    {numberValue(item.dailyRent ?? 0)}
                  </td>
                  {showPriceAndSum && (
                    <>
                      <td style={cellRight}>
                        {numberValue(item.costPrice ?? 0)}
                      </td>
                      <td style={cellRight}>
                        {numberValue(item.costTotal ?? 0)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={cellBorder} colSpan={2}>
                  Итого
                </td>
                <td style={cellCenter}>{numberValue(totalCount)}</td>
                <td style={cellRight} />
                <td style={cellRight}>{numberValue(totalDailyRent)}</td>
                {showPriceAndSum && (
                  <>
                    <td style={cellRight} />
                    <td style={cellRight}>{numberValue(totalCost)}</td>
                  </>
                )}
              </tr>
            </tfoot>
          </table>
        )}
        {showClientGoodsSale && saleItems.length > 0 && (
          <>
            <h3 style={{ marginTop: compact ? 12 : 24 }}>
              Товары, выдаваемые вместе с инструментом
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <thead>
                <tr>
                  <th style={thCenter}>№</th>
                  <th style={thCenter}>Наименование</th>
                  <th style={thCenter}>Количество</th>
                  {showPriceAndSum && (
                    <>
                      <th style={thCenter}>Цена</th>
                      <th style={thCenter}>Сумма</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {saleItems.map((item, idx) => (
                  <tr key={idx}>
                    <td style={cellBorder}>{idx + 1}</td>
                    <td style={cellBorder}>
                      {toolNames[item.analiticId] || item.analiticId}
                    </td>
                    <td style={cellCenter}>{item.count}</td>
                    {showPriceAndSum && (
                      <>
                        <td style={cellRight}>
                          {numberValue(item.price ?? 0)}
                        </td>
                        <td style={cellRight}>
                          {numberValue(item.total ?? 0)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {showPriceAndSum && (
              <p style={{ marginTop: 8 }}>Итого товар: {numberValue(saleTotal)} сум</p>
            )}
          </>
        )}
        {paymentParts.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p style={{ marginBottom: 4 }}>Оплаты клиента</p>
            <p>{paymentParts.join('   |   ')}</p>
          </div>
        )}
        {/* mm надёжнее px при печати; место под рукописную подпись */}
        <div
          aria-hidden
          style={{
            height: '10mm',
            minHeight: '10mm',
            lineHeight: '10mm',
            fontSize: 1,
            overflow: 'hidden',
          }}
        >
          &nbsp;
        </div>
        <div
          style={{
            paddingBottom: compact ? 16 : 0,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{topshirdimLine}</span>
          <span>Принял: _______________</span>
        </div>
      </div>
    );

    return (
      <PrintCopiesWithTearOff ref={ref} copyCount={copyCount} renderCopy={renderCopy} />
    );
  },
);

TransferToolsPrintDocument.displayName = 'TransferToolsPrintDocument';

export default TransferToolsPrintDocument;
