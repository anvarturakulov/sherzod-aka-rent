'use client';

import { useMemo, useState } from 'react';
import { RentalOpenTransfersProps } from './rentalOpenTransfers.props';
import styles from './rentalOpenTransfers.module.css';
import { useEnterpriseName } from '../../hooks/useEnterpriseName';
import { numberValue } from '@/app/service/common/converters';
import {
  formatDisplayDateOrDash,
  formatDisplayDateTime,
} from '@/app/utils/formatDisplayDate';
import { useAppContext } from '@/app/context/app.context';
import { getDocument } from '@/app/components/journals/journal/helpers/journal.functions';

type BillingRole = 'PLAIN' | 'COLUMN' | 'COLUMN_COMPONENT';

type TransferLine = {
  toolId: number;
  toolName: string;
  billingRole: BillingRole;
  initialQty: number;
  openQty: number;
};

type InvoiceRow = {
  id: number;
  date: number;
  settlementDate: number;
  daysOpen: number;
  comment: string | null;
  lines: TransferLine[];
};

type ClientRow = {
  clientId: number;
  clientName: string;
  invoicesCount: number;
  linesCount: number;
  oldestDays: number;
  invoices: InvoiceRow[];
};

type Summary = {
  clientsTotal: number;
  invoicesTotal: number;
  linesTotal: number;
  oldestDays: number;
};

type ReportValues = {
  asOf: number;
  summary: Summary;
  clients: ClientRow[];
};

const emptySummary = (): Summary => ({
  clientsTotal: 0,
  invoicesTotal: 0,
  linesTotal: 0,
  oldestDays: 0,
});

const roleSuffix = (role?: string) => {
  if (role === 'COLUMN') return ' (колонна)';
  if (role === 'COLUMN_COMPONENT') return ' (состав)';
  return '';
};

const invoiceMatches = (invoice: InvoiceRow, query: string) => {
  if (String(invoice.id).includes(query)) return true;
  if (String(invoice.comment ?? '').toLowerCase().includes(query)) return true;
  return (invoice.lines || []).some((line) =>
    String(line.toolName ?? '').toLowerCase().includes(query),
  );
};

const visibleInvoices = (client: ClientRow, query: string) => {
  if (!query) return client.invoices || [];
  if (String(client.clientName ?? '').toLowerCase().includes(query)) {
    return client.invoices || [];
  }
  return (client.invoices || []).filter((invoice) => invoiceMatches(invoice, query));
};

export const RentalOpenTransfers = ({
  className,
  data,
  ...props
}: RentalOpenTransfersProps): JSX.Element => {
  const { mainData, setMainData } = useAppContext();
  const token = mainData.users.user?.token;
  const contentName = mainData.document.contentName;
  const enterpriseName = useEnterpriseName();
  const [query, setQuery] = useState('');
  const [expandedClients, setExpandedClients] = useState<Set<number>>(
    new Set(),
  );

  const values: ReportValues = useMemo(() => {
    const block = Array.isArray(data)
      ? data.find(
          (item: { reportType?: string }) =>
            item?.reportType === 'RentalOpenTransfers',
        )
      : null;
    const raw = block?.values;
    if (!raw || typeof raw !== 'object') {
      return { asOf: 0, summary: emptySummary(), clients: [] };
    }
    return {
      asOf: Number(raw.asOf) || 0,
      summary: { ...emptySummary(), ...(raw.summary ?? {}) },
      clients: Array.isArray(raw.clients) ? raw.clients : [],
    };
  }, [data]);

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return values.clients;
    return values.clients.filter((client) => visibleInvoices(client, q).length > 0);
  }, [values.clients, query]);

  const openDocument = (docId: number) => {
    if (!docId) return;
    getDocument(docId, setMainData, token, mainData, contentName);
  };

  const toggleClient = (id: number) => {
    setExpandedClients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedClients(new Set(filteredClients.map((row) => row.clientId)));
  };

  const collapseAll = () => {
    setExpandedClients(new Set());
  };

  const hasLoaded = Array.isArray(data)
    ? data.some(
        (item: { reportType?: string }) =>
          item?.reportType === 'RentalOpenTransfers',
      )
    : false;

  const q = query.trim().toLowerCase();

  return (
    <div className={`${styles.container} ${className || ''}`} {...props}>
      <div className={styles.title}>
        Аренда — незакрытые накладные
        {enterpriseName ? ` — ${enterpriseName}` : ''}
      </div>

      <div className={styles.subtitle}>
        {values.asOf
          ? `Сейчас: ${formatDisplayDateTime(values.asOf)} · `
          : ''}
        Проведённые Топшириш, по которым инструмент ещё не вернулся. Период
        сводки на этот список не влияет.
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Клиенты</div>
          <div className={styles.summaryValue}>{values.summary.clientsTotal}</div>
        </div>
        <div
          className={`${styles.summaryCard} ${
            values.summary.invoicesTotal > 0 ? styles.summaryWarn : ''
          }`}
        >
          <div className={styles.summaryLabel}>Накладные</div>
          <div className={styles.summaryValue}>
            {values.summary.invoicesTotal}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Строки с остатком</div>
          <div className={styles.summaryValue}>{values.summary.linesTotal}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Самая давняя</div>
          <div className={styles.summaryValue}>{values.summary.oldestDays}</div>
          <div className={styles.summaryHint}>дней</div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по клиенту, номеру или инструменту"
        />
        <button type="button" className={styles.filterBtn} onClick={expandAll}>
          Раскрыть все
        </button>
        <button type="button" className={styles.filterBtn} onClick={collapseAll}>
          Свернуть все
        </button>
      </div>

      {!hasLoaded ? null : filteredClients.length === 0 ? (
        <div className={styles.empty}>
          {values.clients.length === 0
            ? 'Незакрытых накладных нет'
            : 'По поиску ничего не найдено'}
        </div>
      ) : (
        <div className={styles.list} data-report-scroll>
          {filteredClients.map((client) => {
            const expanded = expandedClients.has(client.clientId);
            const invoices = visibleInvoices(client, q);
            return (
              <div key={client.clientId} className={styles.card}>
                <button
                  type="button"
                  className={styles.clientHeader}
                  onClick={() => toggleClient(client.clientId)}
                >
                  <span className={styles.toggle}>{expanded ? '▾' : '▸'}</span>
                  <span className={styles.clientName}>
                    {client.clientName || `#${client.clientId}`}
                  </span>
                  <span className={styles.stat}>
                    <span className={styles.statLabel}>Накладные</span>
                    {q ? invoices.length : client.invoicesCount}
                  </span>
                  <span className={styles.stat}>
                    <span className={styles.statLabel}>Строки</span>
                    {q
                      ? invoices.reduce(
                          (sum, invoice) => sum + (invoice.lines?.length || 0),
                          0,
                        )
                      : client.linesCount}
                  </span>
                  <span className={styles.stat}>
                    <span className={styles.statLabel}>Дней</span>
                    {client.oldestDays}
                  </span>
                </button>

                <div
                  className={`${styles.details} ${expanded ? '' : styles.detailsHidden}`}
                >
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className={styles.orderBlock}>
                      <div className={styles.orderHead}>
                        <button
                          type="button"
                          className={styles.docLink}
                          data-report-doc-anchor={invoice.id}
                          onClick={() => openDocument(invoice.id)}
                        >
                          № {invoice.id}
                        </button>
                        <span className={styles.meta}>
                          {formatDisplayDateOrDash(
                            invoice.settlementDate || invoice.date,
                          )}
                        </span>
                        <span className={styles.meta}>
                          {invoice.daysOpen} дн.
                        </span>
                        {invoice.comment ? (
                          <div className={styles.comment}>{invoice.comment}</div>
                        ) : null}
                      </div>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Инструмент</th>
                            <th>Было</th>
                            <th>Осталось</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(invoice.lines || []).map((line, idx) => (
                            <tr key={`${invoice.id}-${line.toolId}-${idx}`}>
                              <td>
                                {line.toolName}
                                {roleSuffix(line.billingRole)}
                              </td>
                              <td className={styles.numeric}>
                                {numberValue(line.initialQty)}
                              </td>
                              <td
                                className={`${styles.numeric} ${styles.openCell}`}
                              >
                                {numberValue(line.openQty)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
