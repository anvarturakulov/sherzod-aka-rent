'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DocTableItem,
  DocSTATUS,
  DocumentType,
  DocumentModel,
  getBrakItems,
  getReturnItems,
  getSaleItems,
  getTovarItems,
} from '@/app/interfaces/document.interface';
import { TypeReference } from '@/app/interfaces/reference.interface';
import { Schet } from '@/app/interfaces/report.interface';
import { useAppContext } from '@/app/context/app.context';
import { useAllReferences } from '@/app/components/lists/referencesList/hooks/useReferencesData';
import { useDocTableData } from '../hooks/useDocTableData';
import { useProductCatalog } from '@/app/hooks/useProductCatalog';
import ProductCatalog from '@/app/components/productCatalog/productCatalog';
import { Product } from '@/app/interfaces/product.interface';
import { getStockByItem } from '@/app/service/stocks/getStockByItem';
import { getPereodicValueForDate } from '@/app/service/references/getPereodicValueForDate';
import TableRow from './TableRow';
import TableFooter from './TableFooter';
import TableEmptyBox from './TableEmptyBox';
import styles from '../docTableCatalog.module.css';
import { getTotalRentFromReturnRows } from '@/app/service/documents/fillReceiveToolsTable';
import {
  formatPanelAreaM2,
  formatReturnQty,
  getFormworkPanelTotals,
} from '@/app/service/documents/formworkPanelArea';
import { getReceiveToolsPreviewParams } from '@/app/service/documents/fetchReceiveToolsPreview';
import {
  copyReturnRowToSection,
  getReceiveToolsCopyRemainQty,
  ReceiveToolsCopyTarget,
} from '@/app/service/documents/copyReceiveToolsFromReturn';
import { numberValue } from '@/app/service/common/converters';
import { showMessage } from '@/app/service/common/showMessage';
import { getDocumentTypeByComeOut } from '../../docValues/components/helpers/getDocumentTypeByComeOut';
import ReceiveToolsPickerModal from './receiveToolsPickerModal/receiveToolsPickerModal';
import ReceiveToolsPartyModal from './receiveToolsPartyModal/receiveToolsPartyModal';
import { useToolsDocumentBlockSettings } from '@/app/service/settings/useToolsDocumentBlockSettings';
import { sortToolRowsByArticle } from '@/app/service/documents/sortToolsByArticle';

type SectionType = 'return' | 'brak' | 'sale' | 'tovar';

const SECTION_TITLES: Record<SectionType, string> = {
  return: 'Приём',
  brak: 'Брак',
  sale: 'Продажа клиенту',
  tovar: 'Продажа товара клиенту',
};

const COLLAPSIBLE_SECTIONS: SectionType[] = ['brak', 'sale', 'tovar'];

const round2 = (n: number) => Math.round(n * 100) / 100;

interface ReceiveToolsTablesProps {
  items: DocTableItem[];
}

const ReceiveToolsTables = memo<ReceiveToolsTablesProps>(({ items }) => {
  const { mainData, setMainData } = useAppContext();
  const { currentDocument } = mainData.document;
  const { user } = mainData.users;
  const token = user?.token;
  const { data: references } = useAllReferences(token);
  const enterpriseId =
    currentDocument?.enterpriseId ??
    mainData.report?.selectedEnterpriseId ??
    user?.enterpriseId;

  const [pickerOpen, setPickerOpen] = useState(false);
  const [partyOpen, setPartyOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<SectionType, boolean>>({
    return: true,
    brak: false,
    sale: false,
    tovar: false,
  });
  const prevCountsRef = useRef<Record<SectionType, number>>({
    return: 0,
    brak: 0,
    sale: 0,
    tovar: 0,
  });

  const docRef = useRef<DocumentModel | undefined>(currentDocument);
  useEffect(() => {
    docRef.current = currentDocument;
  }, [currentDocument]);

  const returnItems = getReturnItems(items || []);
  const brakItems = getBrakItems(items || []);
  const saleItems = getSaleItems(items || []);
  const tovarItems = getTovarItems(items || []);
  const isKaytarish =
    currentDocument?.documentType === DocumentType.ReceiveToolsFromClient;
  const { showClientGoodsSale } = useToolsDocumentBlockSettings(isKaytarish);
  const tovarWarehouseId = currentDocument?.docValues?.receiverId;

  const sectionItemsMap: Record<SectionType, DocTableItem[]> = {
    return: returnItems,
    brak: brakItems,
    sale: saleItems,
    tovar: tovarItems,
  };

  const typeDocumentByComeOut = getDocumentTypeByComeOut(
    (currentDocument?.documentType as DocumentType) ||
      DocumentType.ReceiveToolsFromClient,
  );

  const toolMetaById = useMemo(() => {
    const map = new Map<number, { article: string; name: string }>();
    for (const ref of references || []) {
      if (ref.id) {
        map.set(ref.id, { article: ref.article || '', name: ref.name || '' });
      }
    }
    return map;
  }, [references]);

  const indicesInFullDoc = useMemo(() => {
    const map: Record<SectionType, number[]> = {
      return: [],
      brak: [],
      sale: [],
      tovar: [],
    };
    (items || []).forEach((it, i) => {
      const t = (it.tableType || 'return') as SectionType;
      if (t in map) map[t].push(i);
    });
    return map;
  }, [items]);

  useEffect(() => {
    COLLAPSIBLE_SECTIONS.forEach((section) => {
      const prevCount = prevCountsRef.current[section];
      const nextCount = sectionItemsMap[section].length;
      if (nextCount > prevCount) {
        setExpandedSections((prev) => ({ ...prev, [section]: true }));
      }
      prevCountsRef.current[section] = nextCount;
    });
  }, [brakItems.length, saleItems.length, tovarItems.length]);

  const handleItemDeleted = useCallback(() => {}, []);
  const { tableState, handleDeleteItem, handleLoadBalance } = useDocTableData(
    items || [],
    handleItemDeleted,
  );

  const handleFill = useCallback(() => {
    const { error } = getReceiveToolsPreviewParams(currentDocument, enterpriseId ?? null);
    if (error) {
      showMessage(error, 'error', setMainData);
      return;
    }
    setPartyOpen(true);
  }, [currentDocument, enterpriseId, setMainData]);

  const handleOpenPicker = useCallback(() => {
    const { error } = getReceiveToolsPreviewParams(currentDocument, enterpriseId ?? null);
    if (error) {
      showMessage(error, 'error', setMainData);
      return;
    }
    setPickerOpen(true);
  }, [currentDocument, enterpriseId, setMainData]);

  const onTovarProductSelected = useCallback(
    async (product: Product, quantity: number, customPrice?: number) => {
      const doc = docRef.current;
      if (!doc || !setMainData || !token) return;

      const warehouse = doc.docValues?.receiverId;
      if (!warehouse) {
        alert('Сначала выберите принимающий склад.');
        return;
      }

      const documentDate = doc.date ?? Date.now();

      try {
        const stockData = await getStockByItem(
          Schet.S29,
          warehouse,
          product.id,
          documentDate,
          enterpriseId ?? undefined,
          token,
        );

        const totalQuantity = Number(stockData?.totalQuantity) || 0;
        if (totalQuantity <= 0) {
          alert(`На складе (S29) нет остатка товара "${product.name}".`);
          return;
        }

        const costPrice = (Number(stockData.totalSum) || 0) / totalQuantity;

        let price = customPrice !== undefined && customPrice > 0 ? customPrice : 0;
        if (price <= 0) {
          const periodic = await getPereodicValueForDate(
            product.id,
            'firstPrice',
            documentDate,
            token,
            enterpriseId ?? undefined,
          );
          price =
            periodic > 0
              ? periodic
              : product.refValues?.firstPrice || product.price || 0;
        }

        if (price <= 0) {
          alert(`Для товара "${product.name}" не найдена цена продажи (firstPrice).`);
          return;
        }

        const newItem: DocTableItem = {
          analiticId: product.id,
          tableType: 'tovar',
          count: quantity,
          balance: stockData.availableQuantity ?? totalQuantity,
          price,
          total: round2(price * quantity),
          costPrice,
          costTotal: round2(costPrice * quantity),
          refCountInBox: product.refValues?.countInBox,
          countByBox: product.refValues?.countInBox
            ? Math.ceil(quantity / product.refValues.countInBox)
            : undefined,
        };

        const latestDoc = docRef.current ?? doc;
        const currentItems = latestDoc.docTableItems ?? [];

        const duplicateIndex = currentItems.findIndex(
          (item) => item.analiticId === product.id && item.tableType === 'tovar',
        );
        if (duplicateIndex >= 0) {
          const proceed = window.confirm(
            `Товар "${product.name}" уже есть в таблице продажи (строка ${duplicateIndex + 1}). Добавить ещё раз?`,
          );
          if (!proceed) return;
        }

        setMainData('currentDocument', {
          ...latestDoc,
          docTableItems: [...currentItems, newItem],
        });
      } catch (e) {
        console.error('Ошибка добавления товара:', e);
        alert(
          e instanceof Error
            ? e.message
            : 'Не удалось получить цену и остаток товара.',
        );
      }
    },
    [setMainData, token, enterpriseId],
  );

  const { isOpen, openCatalog, closeCatalog, handleSelectProduct } = useProductCatalog({
    onProductSelected: onTovarProductSelected,
    currentDocTableItems: currentDocument?.docTableItems ?? [],
  });

  const handleOpenTovarCatalog = useCallback(() => {
    if (!tovarWarehouseId) {
      alert('Сначала выберите принимающий склад.');
      return;
    }
    openCatalog();
  }, [openCatalog, tovarWarehouseId]);

  const handleCopyToSection = useCallback(
    (documentRowIndex: number, target: ReceiveToolsCopyTarget) => {
      const returnItem = items?.[documentRowIndex];
      if (!returnItem) return;

      const remain = getReceiveToolsCopyRemainQty(returnItem, items || []);
      if (remain <= 0) {
        showMessage('Копирование недоступно: остаток исчерпан', 'error', setMainData);
        return;
      }

      const sectionLabel = target === 'brak' ? 'Брак' : 'Продажа клиенту';
      const rawQty = window.prompt(
        `Количество для «${sectionLabel}» (макс. ${remain}):`,
        String(remain),
      );
      if (rawQty === null) return;

      const parsedQty = Number(rawQty.replace(',', '.'));
      if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
        showMessage('Некорректное количество', 'error', setMainData);
        return;
      }

      const result = copyReturnRowToSection(
        currentDocument,
        documentRowIndex,
        target,
        parsedQty,
      );
      if ('error' in result) {
        showMessage(result.error, 'error', setMainData);
        return;
      }

      setMainData?.('currentDocument', {
        ...currentDocument,
        docTableItems: result.docTableItems,
      });
      showMessage(`«${sectionLabel}» ga ko'chirildi`, 'success', setMainData);
    },
    [currentDocument, items, setMainData],
  );

  const toggleSection = useCallback((section: SectionType) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const isDocumentOpen = currentDocument?.docStatus === DocSTATUS.OPEN;

  const renderSection = (section: SectionType, sourceItems: DocTableItem[]) => {
    const sourceIndices = indicesInFullDoc[section];
    const paired = sourceItems.map((item, index) => ({
      item,
      docIndex: sourceIndices[index] ?? index,
    }));
    const ordered =
      section === 'tovar'
        ? paired
        : sortToolRowsByArticle(
            paired,
            (row) => row.item,
            (id) => toolMetaById.get(id) || { article: '', name: '' },
            { tieBreakBySettlementDate: section === 'return' },
          );
    const sectionItems = ordered.map((row) => row.item);
    const indices = ordered.map((row) => row.docIndex);
    const isCollapsible = COLLAPSIBLE_SECTIONS.includes(section);
    const isExpanded = expandedSections[section];
    const rowCount = sectionItems.length;
    const sectionButton =
      section === 'return' ? (
        <button
          type="button"
          className={styles.actionBtn}
          onClick={handleOpenPicker}
          disabled={!isDocumentOpen}
        >
          + Выбрать
        </button>
      ) : section === 'tovar' ? (
        <button
          type="button"
          className={styles.actionBtn}
          onClick={handleOpenTovarCatalog}
          disabled={!isDocumentOpen}
        >
          + Добавить товар
        </button>
      ) : null;

    return (
      <div
        key={section}
        className={`${styles.materialsSection} ${isCollapsible && !isExpanded ? styles.sectionCollapsed : ''}`}
      >
        <div className={styles.sectionHeader}>
          {isCollapsible ? (
            <button
              type="button"
              className={styles.sectionHeaderToggle}
              onClick={() => toggleSection(section)}
              aria-expanded={isExpanded}
            >
              <span className={styles.sectionToggleIcon}>{isExpanded ? '▼' : '▶'}</span>
              <h4>
                {SECTION_TITLES[section]}
                {rowCount > 0 && (
                  <span className={styles.sectionCountBadge}>{rowCount}</span>
                )}
              </h4>
            </button>
          ) : (
            <h4>{SECTION_TITLES[section]}</h4>
          )}
          {isDocumentOpen && sectionButton}
        </div>
        {(!isCollapsible || isExpanded) && (
          <>
            {section === 'return' && (
              <div
                className={`${styles.box} ${styles.boxReceiveToolsReturn} ${styles.receiveToolsColumnHeader}`}
              >
                <div>Наименование</div>
                <div>Олинган сана</div>
                <div>Количество</div>
                <div>Сутки</div>
                <div>Тариф</div>
                <div>Скидка</div>
                <div>Сумма</div>
                <div />
              </div>
            )}
            {section === 'tovar' && (
              <div
                className={`${styles.box} ${styles.boxReceiveTools} ${styles.receiveToolsColumnHeader}`}
              >
                <div>Наименование</div>
                <div>Остаток</div>
                <div>Количество</div>
                <div>—</div>
                <div>—</div>
                <div>—</div>
                <div>Цена</div>
                <div>Сумма</div>
                <div />
              </div>
            )}
            {sectionItems.map((item, index) => (
              <TableRow
                key={`${section}-${indices[index] ?? index}`}
                item={item}
                index={index}
                documentRowIndex={indices[index] ?? index}
                typeReference={TypeReference.TMZ}
                tableState={tableState}
                typeDocumentByComeOut={typeDocumentByComeOut}
                onDelete={handleDeleteItem}
                onLoadBalance={handleLoadBalance}
                onCopyToBrak={
                  section === 'return' && isDocumentOpen
                    ? () => handleCopyToSection(indices[index] ?? index, 'brak')
                    : undefined
                }
                onCopyToSale={
                  section === 'return' && isDocumentOpen
                    ? () => handleCopyToSection(indices[index] ?? index, 'sale')
                    : undefined
                }
                copyRemainQty={
                  section === 'return'
                    ? getReceiveToolsCopyRemainQty(item, items || [])
                    : undefined
                }
              />
            ))}
            {sectionItems.length === 0 && (
              <TableEmptyBox
                docType={
                  section === 'tovar'
                    ? DocumentType.SaleTovar
                    : (currentDocument?.documentType as DocumentType) ||
                      DocumentType.ReceiveToolsFromClient
                }
              />
            )}
            {sectionItems.length > 0 && <TableFooter items={sectionItems} />}
          </>
        )}
      </div>
    );
  };

  const totalRent = getTotalRentFromReturnRows(items);
  const panelTotals = useMemo(
    () => getFormworkPanelTotals(items, references),
    [items, references],
  );

  return (
    <div className={`${styles.mainBox} ${styles.mainBoxTools}`}>
      <div className={styles.receiveToolsToolbar}>
        {isDocumentOpen && (
          <button type="button" className={styles.actionBtn} onClick={handleFill}>
            Заполнить
          </button>
        )}
        {totalRent > 0 && (
          <span className={styles.rentTotal}>
            Доход от аренды: {numberValue(totalRent)} сум
          </span>
        )}
        {panelTotals.areaM2 > 0 && (
          <span className={styles.rentTotal}>
            Опалубка: {formatPanelAreaM2(panelTotals.areaM2)} м², сумма:{' '}
            {numberValue(panelTotals.rentTotal)} сум
          </span>
        )}
        {(panelTotals.columnCount > 0 || panelTotals.columnRentTotal !== 0) && (
          <span className={styles.rentTotal}>
            Колонна: {formatReturnQty(panelTotals.columnCount)} шт., сумма:{' '}
            {numberValue(panelTotals.columnRentTotal)} сум
          </span>
        )}
        {panelTotals.restRentTotal !== 0 && (
          <span className={styles.rentTotal}>
            Остальные: {numberValue(panelTotals.restRentTotal)} сум
          </span>
        )}
      </div>

      {renderSection('return', returnItems)}
      {renderSection('brak', brakItems)}
      {renderSection('sale', saleItems)}
      {isKaytarish && showClientGoodsSale && renderSection('tovar', tovarItems)}

      {currentDocument && (
        <ReceiveToolsPartyModal
          open={partyOpen}
          currentDocument={currentDocument}
          token={token}
          enterpriseId={enterpriseId ?? null}
          setMainData={setMainData}
          onClose={() => setPartyOpen(false)}
        />
      )}

      <ReceiveToolsPickerModal
        open={pickerOpen}
        currentDocument={currentDocument}
        allDocItems={items || []}
        token={token}
        enterpriseId={enterpriseId ?? null}
        setMainData={setMainData}
        onClose={() => setPickerOpen(false)}
      />

      {isKaytarish && showClientGoodsSale && (
        <ProductCatalog
          isOpen={isOpen}
          onClose={closeCatalog}
          onSelectProduct={handleSelectProduct}
          warehouseId={tovarWarehouseId ?? undefined}
          typeDocumentByComeOut="out"
          documentType={DocumentType.SaleTovar}
          documentDate={currentDocument?.date}
          catalogMode="add"
          allowNegativeStock={true}
        />
      )}
    </div>
  );
});

ReceiveToolsTables.displayName = 'ReceiveToolsTables';

export default ReceiveToolsTables;
