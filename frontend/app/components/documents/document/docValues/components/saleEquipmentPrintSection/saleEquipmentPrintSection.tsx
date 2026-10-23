'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { DocumentModel } from '@/app/interfaces/document.interface';
import { ReferenceModel } from '@/app/interfaces/reference.interface';
import { useAllReferences } from '@/app/components/lists/referencesList/hooks/useReferencesData';
import { useAppContext } from '@/app/context/app.context';
import SaleEquipmentPrintDocument from '../../../saleEquipmentPrintDocument/saleEquipmentPrintDocument';
import {
  askPrintCopyCount,
  DEFAULT_PRINT_COPIES,
} from '../../../printCopies/printCopies';

export const useSaleEquipmentPrint = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const { mainData } = useAppContext();
  const { currentDocument } = mainData.document;
  const token = mainData.users.user?.token;
  const { data: references } = useAllReferences(token);

  const [copyCount, setCopyCount] = useState(DEFAULT_PRINT_COPIES);
  const [shouldPrint, setShouldPrint] = useState(false);

  const itemNames = useMemo(() => {
    const map: Record<number, string> = {};
    (references || []).forEach((ref: ReferenceModel) => {
      if (ref.id == null) return;
      map[ref.id] = ref.name;
    });
    return map;
  }, [references]);

  const itemComments = useMemo(() => {
    const map: Record<number, string> = {};
    (references || []).forEach((ref: ReferenceModel) => {
      if (ref.id == null) return;
      const comment = ref.refValues?.comment;
      if (comment) map[ref.id] = comment;
    });
    return map;
  }, [references]);

  const clientRef = references?.find(
    (ref: ReferenceModel) => ref.id === currentDocument?.docValues?.receiverId,
  );
  const clientName = clientRef?.name;
  const clientPhone = [clientRef?.refValues?.phone, clientRef?.refValues?.phone2]
    .map((phone) => (phone ?? '').trim())
    .filter(Boolean)
    .join(', ');

  const warehouseName = references?.find(
    (ref: ReferenceModel) => ref.id === currentDocument?.docValues?.senderId,
  )?.name;

  const printFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Накладная ${currentDocument?.id ?? ''}`,
  });

  useEffect(() => {
    if (!shouldPrint) return;
    setShouldPrint(false);
    printFn();
  }, [shouldPrint, copyCount, printFn]);

  const handlePrint = useCallback(() => {
    const n = askPrintCopyCount();
    if (n == null) return;
    setCopyCount(n);
    setShouldPrint(true);
  }, []);

  const PrintContent = currentDocument ? (
    <div style={{ display: 'none' }}>
      <SaleEquipmentPrintDocument
        ref={printRef}
        document={currentDocument as DocumentModel}
        clientName={clientName}
        clientPhone={clientPhone}
        warehouseName={warehouseName}
        itemNames={itemNames}
        itemComments={itemComments}
        copyCount={copyCount}
      />
    </div>
  ) : null;

  return { handlePrint, PrintContent };
};
