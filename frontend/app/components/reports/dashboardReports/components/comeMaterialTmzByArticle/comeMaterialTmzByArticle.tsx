'use client';

import { numberValue } from '@/app/service/common/converters';
import { ComeMaterialTmzByArticleProps } from './comeMaterialTmzByArticle.props';
import styles from './comeMaterialTmzByArticle.module.css';

export const ComeMaterialTmzByArticle = ({
  data,
  ...props
}: ComeMaterialTmzByArticleProps): JSX.Element => {
  const formatPeriodDate = (value: number | null | undefined): string => {
    if (!value) return '-';
    const date = new Date(Number(value));
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('ru-RU');
  };

  const report = Array.isArray(data)
    ? data.find((item: any) => item?.reportType === 'COMEMATERIALTMZBYARTICLE')
    : null;
  const values = report?.values;
  const materials = values?.materials ?? [];
  const totals = values?.totals;

  if (!values) {
    return (
      <div className={styles.container} {...props}>
        <div className={styles.title}>Приход материалов (артикул)</div>
        <div className={styles.emptyMessage}>Загрузка данных</div>
      </div>
    );
  }

  const periodLabel = `${formatPeriodDate(values.periodStart)} — ${formatPeriodDate(values.periodEnd)}`;

  if (!materials.length) {
    return (
      <div className={styles.container} {...props}>
        <div className={styles.title}>Приход материалов (артикул)</div>
        <div className={styles.subtitle}>Период: {periodLabel}</div>
        <div className={styles.emptyMessage}>
          По документам ComeMaterial материал не найден
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} {...props}>
      <div className={styles.title}>Приход материалов (артикул)</div>
      <div className={styles.subtitle}>
        Период: {periodLabel} · Документы: {totals?.documentsCount ?? 0} ·
        Материалы: {totals?.uniqueMaterials ?? 0} · Артикулы:{' '}
        {totals?.uniqueArticles ?? 0}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={`${styles.center} ${styles.indexCol}`}>№</th>
            <th className={styles.articleCol}>Артикул</th>
            <th>Материал</th>
            <th className={styles.unitCol}>Ед. изм.</th>
            <th className={styles.numeric}>Кол-во</th>
            <th className={styles.numeric}>Сумма</th>
            <th className={styles.numeric}>Строки</th>
            <th className={styles.numeric}>Документы</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material: any, index: number) => (
            <tr key={material.materialId}>
              <td className={`${styles.center} ${styles.indexCol}`}>
                {index + 1}
              </td>
              <td>{material.article || '-'}</td>
              <td>{material.materialName}</td>
              <td className={styles.unitCol}>{material.unit || '-'}</td>
              <td className={styles.numeric}>
                {numberValue(Number(material.totalCount) || 0)}
              </td>
              <td className={styles.numeric}>
                {numberValue(Number(material.totalSum) || 0)}
              </td>
              <td className={styles.numeric}>{material.linesCount ?? 0}</td>
              <td className={styles.numeric}>{material.documentsCount ?? 0}</td>
            </tr>
          ))}
          <tr className={styles.summaryRow}>
            <td colSpan={4} className={styles.center}>
              Итого
            </td>
            <td className={styles.numeric}>
              {numberValue(Number(totals?.totalCount) || 0)}
            </td>
            <td className={styles.numeric}>
              {numberValue(Number(totals?.totalSum) || 0)}
            </td>
            <td colSpan={2} />
          </tr>
        </tbody>
      </table>
    </div>
  );
};
