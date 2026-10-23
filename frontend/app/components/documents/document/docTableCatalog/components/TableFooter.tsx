import React, { memo, useMemo } from 'react';
import cn from 'classnames';
import { DocTableItem, DocumentType } from '@/app/interfaces/document.interface';
import { ReferenceModel } from '@/app/interfaces/reference.interface';
import { useAllReferences } from '@/app/components/lists/referencesList/hooks/useReferencesData';
import { useAppContext } from '@/app/context/app.context';
import styles from '../docTableCatalog.module.css';
import { numberValue } from '@/app/service/common/converters';
import { splitSaleEquipmentTotals } from '@/app/service/documents/saleEquipmentCurrency';

interface TableFooterProps {
  items: DocTableItem[];
  className?: string;
  documentType?: DocumentType;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const TableFooter = memo<TableFooterProps>(({ items, className, documentType }) => {
  const { mainData } = useAppContext();
  const token = mainData.users.user?.token;
  const isSaleEquipment = documentType === DocumentType.SaleEquipment;
  const { data: references } = useAllReferences(isSaleEquipment ? token : undefined);

  const commentsById = useMemo(() => {
    const map: Record<number, string | undefined> = {};
    if (!isSaleEquipment) return map;
    (references || []).forEach((ref: ReferenceModel) => {
      if (ref.id == null) return;
      map[ref.id] = ref.refValues?.comment;
    });
    return map;
  }, [isSaleEquipment, references]);

  const totals = useMemo(() => {
    if (!items || items.length === 0) {
      return {
        totalQuantity: 0,
        totalSum: 0,
        totalDailyRent: 0,
        itemsCount: 0,
      };
    }

    const totalQuantity = items.reduce((sum, item) => sum + (item.count || 0), 0);
    const totalDailyRent = items.reduce((sum, item) => {
      const daily =
        Number(item.dailyRent) > 0
          ? Number(item.dailyRent)
          : round2((Number(item.hourlyTariff) || 0) * (Number(item.count) || 0));
      return sum + daily;
    }, 0);
    const rawTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalSum =
      documentType === DocumentType.TransferSubleaseToolsToClient
        ? totalDailyRent
        : rawTotal;
    const itemsCount = items.length;

    const currencyTotals = isSaleEquipment
      ? splitSaleEquipmentTotals(items, commentsById)
      : null;

    return {
      totalQuantity,
      totalSum,
      totalDailyRent,
      itemsCount,
      currencyTotals,
    };
  }, [items, documentType, isSaleEquipment, commentsById]);

  return (
    <div className={cn(styles.footerBox, className)}>
      <div className={styles.footerContent}>
        <div className={styles.footerStats}>
          <div className={styles.footerStatItem}>
            <span className={styles.footerStatLabel}>ТОВАРЛАР:</span>
            <span className={styles.footerStatValue}>{totals.itemsCount}</span>
          </div>
          
          <div className={styles.footerStatItem}>
            <span className={styles.footerStatLabel}>ИТОГО КОЛ:</span>
            <span className={styles.footerStatValue}>{numberValue(totals.totalQuantity)}</span>
          </div>
          
          {isSaleEquipment ? (
            <>
              <div className={styles.footerStatItem}>
                <span className={styles.footerStatLabel}>ИТОГО $:</span>
                <span className={styles.footerStatValueMain}>{numberValue(totals.currencyTotals?.usd ?? 0)} $</span>
              </div>
              <div className={styles.footerStatItem}>
                <span className={styles.footerStatLabel}>ИТОГО СУМ:</span>
                <span className={styles.footerStatValueMain}>{numberValue(totals.currencyTotals?.som ?? 0)} сум</span>
              </div>
            </>
          ) : (
            <div className={styles.footerStatItem}>
              <span className={styles.footerStatLabel}>ИТОГО СУММА:</span>
              <span className={styles.footerStatValueMain}>{numberValue(totals.totalSum)} сум</span>
            </div>
          )}

          {documentType !== DocumentType.SaleEquipment && (
            <div className={styles.footerStatItem}>
              <span className={styles.footerStatLabel}>ИТОГО ДНЕВНАЯ:</span>
              <span className={styles.footerStatValueMain}>{numberValue(totals.totalDailyRent)} сум</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TableFooter.displayName = 'TableFooter';

export default TableFooter;
