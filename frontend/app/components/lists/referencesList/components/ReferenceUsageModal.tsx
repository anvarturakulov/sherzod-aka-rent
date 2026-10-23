'use client';

import { useEffect } from 'react';
import type { ReferenceUsageResponse } from '@/app/service/references/references.service';
import styles from './ReferenceUsageModal.module.css';

const DISPLAY_LIMIT = 50;

interface ReferenceUsageModalProps {
    open: boolean;
    itemName: string;
    usage: ReferenceUsageResponse | null;
    onClose: () => void;
}

export const ReferenceUsageModal = ({
    open,
    itemName,
    usage,
    onClose,
}: ReferenceUsageModalProps): JSX.Element | null => {
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open || !usage) return null;

    const refsToShow = usage.inReferences.slice(0, DISPLAY_LIMIT);
    const docsToShow = usage.inDocuments.slice(0, DISPLAY_LIMIT);
    const related = usage.inRelated ?? [];
    const relatedToShow = related.slice(0, DISPLAY_LIMIT);

    return (
        <div
            className={styles.overlay}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className={styles.dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="reference-usage-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <div>
                        <h2 id="reference-usage-modal-title" className={styles.title}>
                            Связи
                        </h2>
                        <p className={styles.subtitle}>Справочник: {itemName}</p>
                    </div>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.summary}>
                        <span>
                            Всего: <strong>{usage.counts.total}</strong>
                        </span>
                        <span>
                            В других справочниках: <strong>{usage.counts.inReferences}</strong>
                        </span>
                        <span>
                            В документах: <strong>{usage.counts.inDocuments}</strong>
                        </span>
                        <span>
                            В договорах и других таблицах: <strong>{usage.counts.inRelated ?? related.length}</strong>
                        </span>
                    </div>

                    {usage.inReferences.length > 0 && (
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Другие справочники</h3>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Наименование</th>
                                        <th>Артикул</th>
                                        <th>Тип</th>
                                        <th>Поле</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {refsToShow.map((ref) => (
                                        <tr key={`${ref.referenceId}-${ref.field}`}>
                                            <td>{ref.name}</td>
                                            <td>{ref.article ?? '—'}</td>
                                            <td>{ref.typeReference}</td>
                                            <td>{ref.field}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {usage.inReferences.length > DISPLAY_LIMIT && (
                                <p className={styles.moreHint}>
                                    … ва яна {usage.inReferences.length - DISPLAY_LIMIT} та
                                </p>
                            )}
                        </section>
                    )}

                    {usage.inDocuments.length > 0 && (
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Документы</h3>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID документа</th>
                                        <th>Тип</th>
                                        <th>Поле</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {docsToShow.map((doc) => (
                                        <tr key={`${doc.documentId}-${doc.field}`}>
                                            <td>#{doc.documentId}</td>
                                            <td>{doc.documentType ?? 'UNKNOWN'}</td>
                                            <td>{doc.field}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {usage.inDocuments.length > DISPLAY_LIMIT && (
                                <p className={styles.moreHint}>
                                    … ва яна {usage.inDocuments.length - DISPLAY_LIMIT} та
                                </p>
                            )}
                        </section>
                    )}

                    {related.length > 0 && (
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Договоры и другие таблицы</h3>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Источник</th>
                                        <th>ID</th>
                                        <th>Наименование</th>
                                        <th>Поле</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relatedToShow.map((item) => (
                                        <tr key={`${item.source}-${item.id}-${item.field}`}>
                                            <td>{item.source}</td>
                                            <td>#{item.id}</td>
                                            <td>{item.label || '—'}</td>
                                            <td>{item.field}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {related.length > DISPLAY_LIMIT && (
                                <p className={styles.moreHint}>
                                    … ва яна {related.length - DISPLAY_LIMIT} та
                                </p>
                            )}
                        </section>
                    )}
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.okButton} onClick={onClose}>
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
};
