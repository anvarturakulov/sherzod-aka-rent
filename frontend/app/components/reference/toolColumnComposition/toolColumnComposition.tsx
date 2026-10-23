'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAllReferences } from '@/app/components/lists/referencesList/hooks/useReferencesData';
import { ReferenceModel, TypeReference, TypeTMZ } from '@/app/interfaces/reference.interface';
import { showMessage } from '@/app/service/common/showMessage';
import {
  toolComponentsApi,
  ToolComponentLine,
} from '@/app/service/tools/toolComponents.service';
import styles from './toolColumnComposition.module.css';

interface ToolColumnCompositionProps {
  referenceId?: number | null;
  token?: string;
  disabled?: boolean;
  setMainData?: Function;
}

export default function ToolColumnComposition({
  referenceId,
  token,
  disabled,
  setMainData,
}: ToolColumnCompositionProps) {
  const { data: references } = useAllReferences(token);
  const [lines, setLines] = useState<ToolComponentLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const tools = useMemo(
    () =>
      ((references || []) as ReferenceModel[]).filter(
        (ref) =>
          ref.typeReference === TypeReference.TMZ &&
          ref.refValues?.typeTMZ === TypeTMZ.TOOLS &&
          !ref.isFolder &&
          ref.id !== referenceId,
      ),
    [references, referenceId],
  );

  useEffect(() => {
    if (!token || !referenceId) {
      setLines([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    toolComponentsApi
      .list(token, referenceId)
      .then((rows) => {
        if (!cancelled) setLines(rows);
      })
      .catch((error: Error) => {
        if (!cancelled) showMessage(error.message, 'error', setMainData);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, referenceId, setMainData]);

  const updateLine = (index: number, patch: Partial<ToolComponentLine>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const save = async () => {
    if (!token || !referenceId) return;
    setSaving(true);
    try {
      const saved = await toolComponentsApi.replace(
        token,
        referenceId,
        lines.filter((line) => line.componentReferenceId > 0 && Number(line.qty) > 0),
      );
      setLines(saved);
      showMessage('Состав колонны сохранён', 'success', setMainData);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Ошибка сохранения', 'error', setMainData);
    } finally {
      setSaving(false);
    }
  };

  if (!referenceId) {
    return (
      <div className={styles.box}>
        <div className={styles.title}>Состав колонны</div>
        <div className={styles.note}>Сначала сохраните карточку, потом укажите состав.</div>
      </div>
    );
  }

  return (
    <div className={styles.box}>
      <div className={styles.title}>Состав колонны (на 1 штуку)</div>
      <div className={styles.note}>
        Если состав заполнен, при выдаче клиенту уходят эти детали, а доход считается по тарифу этой карточки.
      </div>
      {loading && <div className={styles.note}>Загрузка…</div>}
      {lines.map((line, index) => (
        <div className={styles.row} key={`${line.id || 'new'}-${index}`}>
          <select
            className={styles.select}
            value={line.componentReferenceId || ''}
            disabled={disabled}
            onChange={(event) =>
              updateLine(index, { componentReferenceId: Number(event.target.value) || 0 })
            }
          >
            <option value="">Деталь</option>
            {tools.map((tool) => (
              <option key={tool.id} value={tool.id}>
                {tool.name}
              </option>
            ))}
          </select>
          <input
            className={styles.qty}
            type="number"
            min="0"
            step="0.01"
            value={line.qty ?? ''}
            disabled={disabled}
            onChange={(event) => updateLine(index, { qty: Number(event.target.value) })}
          />
          <button
            type="button"
            className={styles.remove}
            disabled={disabled}
            onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
          >
            ×
          </button>
        </div>
      ))}
      {!disabled && (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.add}
            onClick={() => setLines((prev) => [...prev, { componentReferenceId: 0, qty: 1 }])}
          >
            Добавить деталь
          </button>
          <button type="button" className={styles.save} disabled={saving} onClick={save}>
            Сохранить состав
          </button>
        </div>
      )}
    </div>
  );
}
