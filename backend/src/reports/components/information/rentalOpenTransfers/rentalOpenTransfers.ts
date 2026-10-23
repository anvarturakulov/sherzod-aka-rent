import { Op } from "sequelize";
import { ClientToolOpenBatch } from "src/clientToolBatches/clientToolOpenBatch.model";
import { DocValues } from "src/docValues/docValues.model";
import { Document } from "src/documents/document.model";

const EPS = 1e-6;
const DAY_MS = 24 * 60 * 60 * 1000;

export type RentalOpenTransferBillingRole =
  | "PLAIN"
  | "COLUMN"
  | "COLUMN_COMPONENT";

export type RentalOpenTransferLine = {
  toolId: number;
  toolName: string;
  billingRole: RentalOpenTransferBillingRole;
  initialQty: number;
  openQty: number;
};

export type RentalOpenTransferInvoice = {
  id: number;
  date: number;
  settlementDate: number;
  daysOpen: number;
  comment: string | null;
  lines: RentalOpenTransferLine[];
};

export type RentalOpenTransferClient = {
  clientId: number;
  clientName: string;
  invoicesCount: number;
  linesCount: number;
  oldestDays: number;
  invoices: RentalOpenTransferInvoice[];
};

export type RentalOpenTransfersSummary = {
  clientsTotal: number;
  invoicesTotal: number;
  linesTotal: number;
  oldestDays: number;
};

export type RentalOpenTransfersValues = {
  asOf: number;
  summary: RentalOpenTransfersSummary;
  clients: RentalOpenTransferClient[];
};

const emptySummary = (): RentalOpenTransfersSummary => ({
  clientsTotal: 0,
  invoicesTotal: 0,
  linesTotal: 0,
  oldestDays: 0,
});

const emptyValues = (asOf: number): RentalOpenTransfersValues => ({
  asOf,
  summary: emptySummary(),
  clients: [],
});

const roundQty = (value: number): number =>
  Math.round((Number(value) || 0) * 1000) / 1000;

const daysBetween = (fromMs: number, toMs: number): number => {
  if (!fromMs || fromMs <= 0) return 0;
  return Math.max(0, Math.floor((toMs - fromMs) / DAY_MS));
};

const refName = (data: any, id: number, fallbackPrefix = "ID"): string => {
  if (!id) return "—";
  if (Array.isArray(data)) {
    const item = data.find((ref: any) => Number(ref?.id) === id);
    if (item?.name) return String(item.name);
  }
  return `${fallbackPrefix} ${id}`;
};

const roleOrder = (role: string): number => {
  if (role === "COLUMN") return 0;
  if (role === "COLUMN_COMPONENT") return 1;
  return 2;
};

const asBillingRole = (value: unknown): RentalOpenTransferBillingRole => {
  if (value === "COLUMN" || value === "COLUMN_COMPONENT") return value;
  return "PLAIN";
};

export const rentalOpenTransfers = async (
  data: any,
  enterpriseId?: number | null,
): Promise<{ reportType: string; values: RentalOpenTransfersValues }> => {
  const asOf = Date.now();
  const resolvedEnterpriseId =
    enterpriseId !== undefined && enterpriseId !== null
      ? Number(enterpriseId)
      : null;

  if (!resolvedEnterpriseId) {
    return { reportType: "RentalOpenTransfers", values: emptyValues(asOf) };
  }

  const batches = await ClientToolOpenBatch.findAll({
    where: {
      enterpriseId: resolvedEnterpriseId,
      openQty: { [Op.gt]: EPS },
    },
    order: [
      ["settlementDate", "ASC"],
      ["id", "ASC"],
    ],
  });

  if (!batches.length) {
    return { reportType: "RentalOpenTransfers", values: emptyValues(asOf) };
  }

  const docIds = [
    ...new Set(
      batches
        .map((batch) => Number(batch.transferDocId))
        .filter((id) => id > 0),
    ),
  ];

  const docs = docIds.length
    ? await Document.findAll({
        where: { id: { [Op.in]: docIds } },
        include: [DocValues],
      })
    : [];

  const docById = new Map(docs.map((doc) => [Number(doc.id), doc]));

  type AccInvoice = RentalOpenTransferInvoice;
  type AccClient = {
    clientId: number;
    clientName: string;
    invoices: Map<number, AccInvoice>;
  };

  const clientsMap = new Map<number, AccClient>();

  for (const batch of batches) {
    const openQty = Number(batch.openQty) || 0;
    if (openQty <= EPS) continue;

    const clientId = Number(batch.clientId);
    let client = clientsMap.get(clientId);
    if (!client) {
      client = {
        clientId,
        clientName: refName(data, clientId),
        invoices: new Map(),
      };
      clientsMap.set(clientId, client);
    }

    const docId = Number(batch.transferDocId);
    const settlementDate = Number(batch.settlementDate) || 0;
    let invoice = client.invoices.get(docId);
    if (!invoice) {
      const doc = docById.get(docId);
      const date = Number(doc?.date) || settlementDate;
      const comment = doc?.docValues?.comment
        ? String(doc.docValues.comment).trim()
        : "";
      invoice = {
        id: docId,
        date,
        settlementDate,
        daysOpen: daysBetween(settlementDate || date, asOf),
        comment: comment || null,
        lines: [],
      };
      client.invoices.set(docId, invoice);
    } else if (
      settlementDate > 0 &&
      (invoice.settlementDate <= 0 || settlementDate < invoice.settlementDate)
    ) {
      invoice.settlementDate = settlementDate;
      invoice.daysOpen = daysBetween(settlementDate, asOf);
    }

    invoice.lines.push({
      toolId: Number(batch.toolId),
      toolName: refName(data, Number(batch.toolId), "Ускуна"),
      billingRole: asBillingRole(batch.billingRole),
      initialQty: roundQty(Number(batch.initialQty) || 0),
      openQty: roundQty(openQty),
    });
  }

  const clients: RentalOpenTransferClient[] = [...clientsMap.values()]
    .map((client) => {
      const invoices = [...client.invoices.values()]
        .map((invoice) => ({
          ...invoice,
          lines: [...invoice.lines].sort(
            (a, b) =>
              roleOrder(a.billingRole) - roleOrder(b.billingRole) ||
              a.toolName.localeCompare(b.toolName, "uz"),
          ),
        }))
        .sort(
          (a, b) => a.settlementDate - b.settlementDate || a.id - b.id,
        );
      const linesCount = invoices.reduce(
        (sum, invoice) => sum + invoice.lines.length,
        0,
      );
      const oldestDays = invoices.reduce(
        (max, invoice) => Math.max(max, invoice.daysOpen),
        0,
      );
      return {
        clientId: client.clientId,
        clientName: client.clientName,
        invoicesCount: invoices.length,
        linesCount,
        oldestDays,
        invoices,
      };
    })
    .sort((a, b) => a.clientName.localeCompare(b.clientName, "uz"));

  const summary: RentalOpenTransfersSummary = {
    clientsTotal: clients.length,
    invoicesTotal: clients.reduce((sum, client) => sum + client.invoicesCount, 0),
    linesTotal: clients.reduce((sum, client) => sum + client.linesCount, 0),
    oldestDays: clients.reduce((max, client) => Math.max(max, client.oldestDays), 0),
  };

  return {
    reportType: "RentalOpenTransfers",
    values: { asOf, summary, clients },
  };
};
