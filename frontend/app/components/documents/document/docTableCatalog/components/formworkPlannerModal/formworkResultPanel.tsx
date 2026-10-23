'use client';

import React from 'react';
import cn from 'classnames';
import { FormworkKind, FORMWORK_KIND_LABELS } from '@/app/interfaces/reference.interface';
import { FormworkSolveResult, FwSpecRow } from '@/app/service/formwork/formwork.types';
import styles from './formworkPlannerModal.module.css';

interface FormworkResultPanelProps {
  result: FormworkSolveResult;
  compact?: boolean;
}

const GROUPS: { kinds: FormworkKind[]; title: string }[] = [
  { kinds: [FormworkKind.PANEL], title: FORMWORK_KIND_LABELS[FormworkKind.PANEL] },
  {
    kinds: [FormworkKind.CORNER_OUTER, FormworkKind.CORNER_INNER],
    title: 'Угловые элементы',
  },
  {
    kinds: [FormworkKind.LOCK, FormworkKind.BRACE, FormworkKind.TIE],
    title: 'Комплектующие',
  },
];

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

export const SpecTable = ({ spec, stockKnown }: { spec: FwSpecRow[]; stockKnown: boolean }) => (
  <table className={styles.table}>
    <thead>
      <tr>
        <th>Наименование</th>
        <th className={styles.num}>Нужно</th>
        {stockKnown && <th className={styles.num}>На складе</th>}
        {stockKnown && <th className={styles.num}>Выдать</th>}
        {stockKnown && <th className={styles.num}>Не хватает</th>}
      </tr>
    </thead>
    <tbody>
      {GROUPS.map((group) => {
        const rows = spec.filter((r) => group.kinds.includes(r.kind));
        if (!rows.length) return null;
        return (
          <React.Fragment key={group.title}>
            <tr className={styles.groupRow}>
              <td colSpan={stockKnown ? 5 : 2}>{group.title}</td>
            </tr>
            {rows.map((r) => (
              <tr key={r.analiticId}>
                <td>
                  {r.name}
                  {r.size ? <span style={{ color: '#64748b' }}> · {r.size}</span> : null}
                  {r.idealNeed !== r.need && (
                    <span style={{ color: '#64748b' }} title="В оптимальном варианте">
                      {' '}
                      (опт. {fmt(r.idealNeed)})
                    </span>
                  )}
                </td>
                <td className={styles.num}>{fmt(r.need)}</td>
                {stockKnown && <td className={styles.num}>{fmt(r.stock)}</td>}
                {stockKnown && (
                  <td className={cn(styles.num, { [styles.okCell]: r.issue > 0 })}>{fmt(r.issue)}</td>
                )}
                {stockKnown && (
                  <td className={cn(styles.num, { [styles.shortCell]: r.shortage > 0 })}>
                    {r.shortage > 0 ? fmt(r.shortage) : '—'}
                  </td>
                )}
              </tr>
            ))}
          </React.Fragment>
        );
      })}
    </tbody>
  </table>
);

export default function FormworkResultPanel({ result, compact }: FormworkResultPanelProps) {
  const t = result.totals;
  const shortageRows = result.spec.filter((r) => r.shortage > 0);

  return (
    <>
      <div className={styles.card}>
        <h4 className={styles.cardTitle}>
          Результат
          <span className={cn(styles.stockBadge, { [styles.stockBadgeUnknown]: !result.stockKnown })}>
            {result.stockKnown ? 'Остаток склада учтён' : 'Остаток склада неизвестен'}
          </span>
        </h4>
        <div className={styles.totals}>
          <div>
            Ярусы: <b>{result.tiers.map((h) => `${h}`).join(' + ')} мм</b>
          </div>
          <div>
            Щиты: <b>{t.panels}</b>
          </div>
          <div>
            Внешний контур: <b>{(t.outerLength / 1000).toFixed(2)} м</b>
          </div>
          <div>
            Внутренний контур: <b>{(t.holeLength / 1000).toFixed(2)} м</b>
          </div>
          <div>
            Углы: <b>{t.cornersOuter}</b> внешних, <b>{t.cornersInner}</b> внутренних
          </div>
          <div>
            Стыки: <b>{t.joints}</b>
          </div>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div>
          {result.warnings.map((w, i) => (
            <div key={i} className={styles.warning}>
              {w}
            </div>
          ))}
        </div>
      )}

      {!compact && shortageRows.length > 0 && (
        <div className={styles.card} style={{ borderColor: '#fecaca', background: '#fff5f5' }}>
          <h4 className={styles.cardTitle} style={{ color: '#b91c1c' }}>
            Не хватает на складе
          </h4>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
            {shortageRows.map((r) => (
              <li key={r.analiticId}>
                {r.name}
                {r.size ? ` (${r.size})` : ''}: <b>{fmt(r.shortage)}</b> шт.
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.card}>
        <h4 className={styles.cardTitle}>Спецификация</h4>
        {result.spec.length ? (
          <SpecTable spec={result.spec} stockKnown={result.stockKnown} />
        ) : (
          <div className={styles.empty}>Нет элементов для расчёта</div>
        )}
      </div>
    </>
  );
}
