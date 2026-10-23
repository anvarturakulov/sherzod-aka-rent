'use client';

import React, { forwardRef } from 'react';
import {
  DocumentModel,
  DocTableItem,
  getReturnItems,
  getBrakItems,
  getSaleItems,
  getTovarItems,
} from '@/app/interfaces/document.interface';
import { formatDisplayDateTime } from '@/app/utils/formatDisplayDate';
import { numberValue } from '@/app/service/common/converters';
import { getTotalRentFromReturnRows } from '@/app/service/documents/fillReceiveToolsTable';
import {
  formatPanelAreaM2,
  formatReturnQty,
  FormworkPanelTotals,
} from '@/app/service/documents/formworkPanelArea';
import {
  formatRentHours,
  getReceiveToolsRentDays,
  getReceiveToolsReturnDateTime,
} from '@/app/service/documents/receiveToolsRent';
import { PrintCopiesWithTearOff } from '../printCopies/printCopies';
import { sortToolRowsByArticle } from '@/app/service/documents/sortToolsByArticle';
import { getReceiveToolsIncomeTotal } from '@/app/service/documents/optionalPaymentFields';

export type ReceiveToolsPrintDocumentProps = {
  document: DocumentModel;
  clientName?: string;
  clientPhone?: string;
  warehouseName?: string;
  delivererName?: string;
  contractBasis?: string;
  toolNames: Record<number, string>;
  toolArticles?: Record<number, string>;
  copyCount?: number;
  showClientGoodsSale?: boolean;
  showExtraCharge?: boolean;
  panelTotals?: FormworkPanelTotals;
  transferComment?: string;
};

const cellStyle = { border: '1.5px solid #000', padding: 6 };
const cellCenter = { ...cellStyle, textAlign: 'center' as const };
const cellRight = { ...cellStyle, textAlign: 'right' as const };

const ReceiveToolsPrintDocument = forwardRef<HTMLDivElement, ReceiveToolsPrintDocumentProps>(
  (
    {
      document,
      clientName,
      clientPhone,
      toolNames,
      toolArticles = {},
      copyCount = 1,
      showClientGoodsSale = true,
      showExtraCharge = true,
      panelTotals,
      transferComment,
    },
    ref,
  ) => {
    const toolMeta = (id: number) => ({
      article: toolArticles[id] || '',
      name: toolNames[id] || '',
    });
    const returnItems = sortToolRowsByArticle(
      getReturnItems(document.docTableItems || []),
      (item) => item,
      toolMeta,
      { tieBreakBySettlementDate: true },
    );
    const brakItems = sortToolRowsByArticle(
      getBrakItems(document.docTableItems || []),
      (item) => item,
      toolMeta,
    );
    const saleItems = sortToolRowsByArticle(
      getSaleItems(document.docTableItems || []),
      (item) => item,
      toolMeta,
    );
    const tovarItems = getTovarItems(document.docTableItems || []);
    const totalRent = getTotalRentFromReturnRows(document.docTableItems);
    const panels = panelTotals ?? {
      areaM2: 0,
      rentTotal: 0,
      columnCount: 0,
      columnRentTotal: 0,
      restRentTotal: 0,
    };
    const returnDateTime = getReceiveToolsReturnDateTime(document);
    const compact = copyCount >= 2;
    const deliverySum = Number(document.docValues?.deliverySum || 0);
    const returnDeliverySum = Number(document.docValues?.returnDeliverySum || 0);
    const showDelivery = deliverySum > 0;
    const showReturnDelivery = returnDeliverySum > 0;
    const showDefect =
      showExtraCharge && Number(document.docValues?.defectCost || 0) > 0;
    const phone = (clientPhone ?? '').trim();
    const comment = (transferComment ?? '').trim();
    const clientFields = [
      { label: 'Клиент', value: clientName || '—' },
      ...(phone ? [{ label: 'Телефон', value: phone }] : []),
      ...(comment ? [{ label: 'Комментарий', value: comment }] : []),
    ];
    const amountPairs: { label: string; value: string; breakBefore?: boolean }[] = [
      { label: 'Доход от аренды', value: `${numberValue(totalRent)} сум` },
    ];
    if (panels.areaM2 > 0) {
      amountPairs.push({
        label: 'Опалубка',
        value: `${formatPanelAreaM2(panels.areaM2)} м², сумма: ${numberValue(panels.rentTotal)} сум`,
      });
    }
    if (panels.columnCount > 0 || panels.columnRentTotal !== 0) {
      amountPairs.push({
        label: 'Колонна',
        value: `${formatReturnQty(panels.columnCount)} шт., сумма: ${numberValue(panels.columnRentTotal)} сум`,
      });
    }
    if (panels.restRentTotal !== 0) {
      amountPairs.push({
        label: 'Остальные',
        value: `${numberValue(panels.restRentTotal)} сум`,
      });
    }
    if (showDelivery) {
      amountPairs.push({
        label: 'Доставка',
        value: `${numberValue(deliverySum)} сум`,
        breakBefore: true,
      });
    }
    if (showReturnDelivery) {
      amountPairs.push({
        label: 'Возврат',
        value: `${numberValue(returnDeliverySum)} сум`,
      });
    }
    if (showDefect) {
      amountPairs.push({
        label: 'Расходы по браку',
        value: `${numberValue(document.docValues?.defectCost ?? 0)} сум`,
      });
    }
    amountPairs.push({
      label: 'Всего',
      value: `${numberValue(
        getReceiveToolsIncomeTotal(document.docValues, document.docTableItems),
      )} сум`,
    });
    const valueStyle = { fontWeight: 600 } as const;

    const renderSimpleTable = (title: string, rows: DocTableItem[]) => {
      if (rows.length === 0) return null;
      return (
        <>
          <h3 style={{ marginTop: compact ? 8 : undefined }}>{title}</h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: compact ? 8 : 16,
            }}
          >
            <thead>
              <tr>
                <th style={cellStyle}>№</th>
                <th style={cellStyle}>Наименование</th>
                <th style={cellStyle}>Количество</th>
                <th style={cellStyle}>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, idx) => (
                <tr key={idx}>
                  <td style={cellStyle}>{idx + 1}</td>
                  <td style={cellStyle}>
                    {toolNames[item.analiticId] || item.analiticId}
                  </td>
                  <td style={cellStyle}>{item.count}</td>
                  <td style={cellStyle}>
                    {numberValue(item.costTotal ?? item.total ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    };

    const renderReturnTable = () => (
      <>
        <h3 style={{ marginTop: compact ? 8 : undefined }}>Возврат</h3>
        {returnItems.length === 0 ? (
          <p>—</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: compact ? 8 : 16,
            }}
          >
            <thead>
              <tr>
                <th style={cellStyle}>№</th>
                <th style={cellStyle}>Наименование</th>
                <th style={cellCenter}>Дата получения</th>
                <th style={cellCenter}>Количество</th>
                <th style={cellCenter}>Сутки</th>
                <th style={cellCenter}>Тариф</th>
                <th style={cellRight}>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {returnItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={cellStyle}>{idx + 1}</td>
                  <td style={cellStyle}>
                    {toolNames[item.analiticId] || item.analiticId}
                  </td>
                  <td style={cellCenter}>{formatDisplayDateTime(Number(item.settlementDate)) || '—'}</td>
                  <td style={cellCenter}>{item.count}</td>
                  <td style={cellCenter}>
                    {formatRentHours(getReceiveToolsRentDays(item, returnDateTime))}
                  </td>
                  <td style={cellCenter}>{numberValue(item.hourlyTariff ?? 0)}</td>
                  <td style={cellRight}>{numberValue(item.total ?? 0)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...cellRight, fontWeight: 700 }} colSpan={6}>
                  Итого
                </td>
                <td style={{ ...cellRight, fontWeight: 700 }}>{numberValue(totalRent)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </>
    );

    const renderTovarTable = () => {
      if (tovarItems.length === 0) return null;
      return (
        <>
          <h3 style={{ marginTop: compact ? 8 : undefined }}>Продажа товара клиенту</h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: compact ? 8 : 16,
            }}
          >
            <thead>
              <tr>
                <th style={cellStyle}>№</th>
                <th style={cellStyle}>Наименование</th>
                <th style={cellStyle}>Количество</th>
                <th style={cellStyle}>Цена</th>
                <th style={cellStyle}>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {tovarItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={cellStyle}>{idx + 1}</td>
                  <td style={cellStyle}>
                    {toolNames[item.analiticId] || item.analiticId}
                  </td>
                  <td style={cellStyle}>{item.count}</td>
                  <td style={cellStyle}>{numberValue(item.price ?? 0)}</td>
                  <td style={cellStyle}>{numberValue(item.total ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    };

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
            fontSize: compact ? 16 : 22,
            fontWeight: 700,
            letterSpacing: compact ? '0.06em' : '0.12em',
            textTransform: 'uppercase',
            margin: 0,
            paddingBottom: compact ? 6 : 8,
          }}
        >
          Акт приёма инструмента
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            padding: compact ? '4px 0' : '6px 0',
            borderBottom: '1px solid #000',
            lineHeight: 1.35,
          }}
        >
          <span>
            № <span style={valueStyle}>{document.id}</span>
          </span>
          <span style={valueStyle}>{formatDisplayDateTime(returnDateTime)}</span>
        </div>
        <div
          style={{
            padding: compact ? '4px 0' : '6px 0',
            borderBottom: '1px solid #000',
            lineHeight: 1.4,
          }}
        >
          {clientFields.map((field, index) => (
            <span key={field.label}>
              {index > 0 ? <span style={{ margin: '0 0.65em' }}>·</span> : null}
              {field.label}: <span style={valueStyle}>{field.value}</span>
            </span>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: compact ? 18 : 28,
            rowGap: compact ? 2 : 4,
            margin: compact ? '6px 0 8px' : '8px 0 12px',
            lineHeight: 1.4,
          }}
        >
          {amountPairs.map((pair) => (
            <React.Fragment key={pair.label}>
              {pair.breakBefore ? (
                <span style={{ flexBasis: '100%', height: 0 }} />
              ) : null}
              <span>
                {pair.label} <span style={valueStyle}>{pair.value}</span>
              </span>
            </React.Fragment>
          ))}
        </div>

        {renderReturnTable()}
        {renderSimpleTable('Брак', brakItems)}
        {renderSimpleTable('Продажа клиенту', saleItems)}
        {showClientGoodsSale && renderTovarTable()}

        <div
          style={{
            marginTop: compact ? 88 : 128,
            paddingBottom: compact ? 16 : 0,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Сдал: _______________</span>
          <span>Принял: _______________</span>
        </div>
      </div>
    );

    return (
      <PrintCopiesWithTearOff ref={ref} copyCount={copyCount} renderCopy={renderCopy} />
    );
  },
);

ReceiveToolsPrintDocument.displayName = 'ReceiveToolsPrintDocument';

export default ReceiveToolsPrintDocument;
