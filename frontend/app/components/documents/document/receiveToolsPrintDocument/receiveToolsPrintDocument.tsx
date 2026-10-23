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

export type ReceiveToolsPrintDocumentProps = {
  document: DocumentModel;
  clientName?: string;
  warehouseName?: string;
  delivererName?: string;
  contractBasis?: string;
  toolNames: Record<number, string>;
  toolArticles?: Record<number, string>;
  copyCount?: number;
  showClientGoodsSale?: boolean;
  showExtraCharge?: boolean;
  panelTotals?: FormworkPanelTotals;
};

const cellStyle = { border: '1.5px solid #000', padding: 6 };

const ReceiveToolsPrintDocument = forwardRef<HTMLDivElement, ReceiveToolsPrintDocumentProps>(
  (
    {
      document,
      clientName,
      warehouseName,
      delivererName,
      contractBasis,
      toolNames,
      toolArticles = {},
      copyCount = 1,
      showClientGoodsSale = true,
      showExtraCharge = true,
      panelTotals,
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
    const showDelivery =
      showExtraCharge && Number(document.docValues?.deliverySum || 0) > 0;
    const showDefect =
      showExtraCharge && Number(document.docValues?.defectCost || 0) > 0;
    const showExtras = showDelivery || showDefect;

    const renderSimpleTable = (title: string, rows: DocTableItem[]) => (
      <>
        <h3 style={{ marginTop: compact ? 8 : undefined }}>{title}</h3>
        {rows.length === 0 ? (
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
        )}
      </>
    );

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
                <th style={cellStyle}>Олинган сана</th>
                <th style={cellStyle}>Количество</th>
                <th style={cellStyle}>Сутки</th>
                <th style={cellStyle}>Тариф</th>
                <th style={cellStyle}>Цена</th>
                <th style={cellStyle}>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {returnItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={cellStyle}>{idx + 1}</td>
                  <td style={cellStyle}>
                    {toolNames[item.analiticId] || item.analiticId}
                  </td>
                  <td style={cellStyle}>{formatDisplayDateTime(Number(item.settlementDate)) || '—'}</td>
                  <td style={cellStyle}>{item.count}</td>
                  <td style={cellStyle}>
                    {formatRentHours(getReceiveToolsRentDays(item, returnDateTime))}
                  </td>
                  <td style={cellStyle}>{numberValue(item.hourlyTariff ?? 0)}</td>
                  <td style={cellStyle}>{numberValue(item.price ?? 0)}</td>
                  <td style={cellStyle}>{numberValue(item.total ?? 0)}</td>
                </tr>
              ))}
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
        <h2 style={{ textAlign: 'center', fontSize: compact ? 16 : undefined, margin: '0 0 8px' }}>
          Акт приёма инструмента
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            columnGap: compact ? 12 : 20,
            rowGap: compact ? 2 : 4,
            marginBottom: compact ? 6 : 8,
            lineHeight: 1.35,
          }}
        >
          <div>
            <b>№</b> {document.id}
          </div>
          <div>
            <b>Дата:</b> {formatDisplayDateTime(returnDateTime)}
          </div>
          <div>
            <b>Клиент:</b> {clientName || '—'}
          </div>
          <div>
            <b>Склад:</b> {warehouseName || '—'}
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <b>Основание:</b> {contractBasis || '—'}
          </div>
          <div>
            <b>Доход от аренды:</b> {numberValue(totalRent)} сум
          </div>
          {panels.areaM2 > 0 && (
            <div>
              <b>Опалубка:</b> {formatPanelAreaM2(panels.areaM2)} м², сумма:{' '}
              {numberValue(panels.rentTotal)} сум
            </div>
          )}
          {(panels.columnCount > 0 || panels.columnRentTotal !== 0) && (
            <div>
              <b>Колонна:</b> {formatReturnQty(panels.columnCount)} шт., сумма:{' '}
              {numberValue(panels.columnRentTotal)} сум
            </div>
          )}
          {panels.restRentTotal !== 0 && (
            <div>
              <b>Остальные:</b> {numberValue(panels.restRentTotal)} сум
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: compact ? 16 : 24,
            rowGap: compact ? 2 : 4,
            marginBottom: showExtras ? (compact ? 2 : 4) : compact ? 8 : 12,
            lineHeight: 1.35,
          }}
        >
          <span>
            <b>Наличные:</b> {numberValue(document.docValues?.initialPayment ?? 0)}
          </span>
          <span>
            <b>Карта:</b> {numberValue(document.docValues?.cashFromPartner ?? 0)}
          </span>
          <span>
            <b>USD:</b> {numberValue(document.docValues?.usd ?? 0)} (курс:{' '}
            {numberValue(document.docValues?.currency ?? 0)})
          </span>
          <span>
            <b>Сдача:</b> {numberValue(document.docValues?.changeToClient ?? 0)}
          </span>
          <span>
            <b>В долг:</b> {numberValue(document.docValues?.debtSum ?? 0)}
          </span>
        </div>
        {showExtras && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              columnGap: compact ? 16 : 24,
              rowGap: compact ? 2 : 4,
              marginBottom: compact ? 8 : 12,
              lineHeight: 1.35,
            }}
          >
            {showDelivery && (
              <span>
                <b>Доставка:</b> {numberValue(document.docValues?.deliverySum ?? 0)} сум
                {delivererName ? ` (${delivererName})` : ''}
              </span>
            )}
            {showDefect && (
              <span>
                <b>Расходы по браку:</b> {numberValue(document.docValues?.defectCost ?? 0)} сум
              </span>
            )}
          </div>
        )}

        {renderReturnTable()}
        {renderSimpleTable('Брак', brakItems)}
        {renderSimpleTable('Продажа клиенту', saleItems)}
        {showClientGoodsSale && renderTovarTable()}

        <div
          style={{
            marginTop: compact ? 48 : 64,
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
