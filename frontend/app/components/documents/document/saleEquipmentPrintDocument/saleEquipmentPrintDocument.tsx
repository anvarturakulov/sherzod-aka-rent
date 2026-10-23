'use client';

import React, { forwardRef } from 'react';
import { DocumentModel } from '@/app/interfaces/document.interface';
import { formatDisplayDate } from '@/app/utils/formatDisplayDate';
import { numberValue } from '@/app/service/common/converters';
import { splitSaleEquipmentTotals } from '@/app/service/documents/saleEquipmentCurrency';
import { PrintCopiesWithTearOff } from '../printCopies/printCopies';

const cellBorder = { border: '1.5px solid #000', padding: 6 } as const;
const cellCenter = { ...cellBorder, textAlign: 'center' as const };
const cellRight = { ...cellBorder, textAlign: 'right' as const };
const thCenter = { ...cellBorder, textAlign: 'center' as const };

export type SaleEquipmentPrintDocumentProps = {
  document: DocumentModel;
  clientName?: string;
  warehouseName?: string;
  itemNames: Record<number, string>;
  itemComments?: Record<number, string>;
  copyCount?: number;
};

const SaleEquipmentPrintDocument = forwardRef<HTMLDivElement, SaleEquipmentPrintDocumentProps>(
  ({ document, clientName, warehouseName, itemNames, itemComments = {}, copyCount = 1 }, ref) => {
    const items = (document.docTableItems || []).filter((item) => Number(item.analiticId) > 0);
    const totalCount = items.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
    const { usd: totalUsd, som: totalSom } = splitSaleEquipmentTotals(items, itemComments);
    const compact = copyCount >= 2;

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
          НАКЛАДНАЯ
        </h2>
        <p>Дата: {formatDisplayDate(document.date)}</p>
        <p>Склад: {warehouseName || '—'}</p>
        <p>Покупатель: {clientName || '—'}</p>
        {document.docValues?.comment ? <p>Комментарий: {document.docValues.comment}</p> : null}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: compact ? 8 : 16 }}>
          <thead>
            <tr>
              <th style={thCenter}>№</th>
              <th style={thCenter}>Наименование</th>
              <th style={thCenter}>Количество</th>
              <th style={thCenter}>Цена</th>
              <th style={thCenter}>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td style={cellBorder}>{idx + 1}</td>
                <td style={cellBorder}>{itemNames[item.analiticId] || item.analiticId}</td>
                <td style={cellCenter}>{numberValue(item.count)}</td>
                <td style={cellRight}>{numberValue(item.price ?? 0)}</td>
                <td style={cellRight}>{numberValue(item.total ?? 0)}</td>
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
              <td style={cellRight} />
            </tr>
          </tfoot>
        </table>
        <p style={{ marginTop: 8 }}>Итого $: {numberValue(totalUsd)} $</p>
        <p>Итого сум: {numberValue(totalSom)} сум</p>
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
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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

SaleEquipmentPrintDocument.displayName = 'SaleEquipmentPrintDocument';

export default SaleEquipmentPrintDocument;
