import { Op } from "sequelize";
import { ClientToolBatchesService } from "./clientToolBatches.service";

const mockTransaction = { LOCK: { UPDATE: "UPDATE" } } as any;

const makeBatch = (overrides: Record<string, unknown> = {}) => {
  const batch = {
    id: 1,
    transferDocId: 100,
    toolId: 25182,
    openQty: 1,
    initialQty: 1,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return batch;
};

const makeReceiveDoc = (
  docTableItems: Array<Record<string, unknown>>,
  overrides: Record<string, unknown> = {},
) => ({
  id: 187741,
  enterpriseId: 1,
  docValues: { senderId: 10 },
  docTableItems,
  ...overrides,
});

describe("ClientToolBatchesService.consumeBatchesOnReceivePosted", () => {
  let service: ClientToolBatchesService;
  let batchModel: {
    findAll: jest.Mock;
  };
  let consumptionModel: {
    count: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(() => {
    batchModel = { findAll: jest.fn() };
    consumptionModel = {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({}),
    };
    service = new ClientToolBatchesService(
      batchModel as any,
      consumptionModel as any,
      {} as any,
    );
  });

  it("consumes open batch for return row only", async () => {
    const batch = makeBatch();
    batchModel.findAll.mockResolvedValue([batch]);

    await service.consumeBatchesOnReceivePosted(
      makeReceiveDoc([
        {
          analiticId: 25182,
          count: 1,
          tableType: "return",
          sourceTransferDocId: 100,
        },
      ]) as any,
      mockTransaction,
    );

    expect(batch.openQty).toBe(0);
    expect(consumptionModel.create).toHaveBeenCalledTimes(1);
    expect(consumptionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ tableType: "return", qty: 1 }),
      expect.any(Object),
    );
  });

  it("does not double-consume when brak row is copied from return", async () => {
    const batch = makeBatch();
    batchModel.findAll.mockResolvedValue([batch]);

    await service.consumeBatchesOnReceivePosted(
      makeReceiveDoc([
        {
          analiticId: 25182,
          count: 1,
          tableType: "return",
          sourceTransferDocId: 100,
        },
        {
          analiticId: 25182,
          count: 1,
          tableType: "brak",
          sourceTransferDocId: 100,
        },
      ]) as any,
      mockTransaction,
    );

    expect(batch.openQty).toBe(0);
    expect(consumptionModel.create).toHaveBeenCalledTimes(1);
  });

  it("does not double-consume when sale row is copied from return", async () => {
    const batch = makeBatch();
    batchModel.findAll.mockResolvedValue([batch]);

    await service.consumeBatchesOnReceivePosted(
      makeReceiveDoc([
        {
          analiticId: 25182,
          count: 1,
          tableType: "return",
          sourceTransferDocId: 100,
        },
        {
          analiticId: 25182,
          count: 1,
          tableType: "sale",
          sourceTransferDocId: 100,
        },
      ]) as any,
      mockTransaction,
    );

    expect(batch.openQty).toBe(0);
    expect(consumptionModel.create).toHaveBeenCalledTimes(1);
  });

  it("throws when return qty exceeds open batches", async () => {
    const batch = makeBatch();
    batchModel.findAll.mockResolvedValue([batch]);

    await expect(
      service.consumeBatchesOnReceivePosted(
        makeReceiveDoc([
          {
            analiticId: 25182,
            count: 2,
            tableType: "return",
            sourceTransferDocId: 100,
          },
        ]) as any,
        mockTransaction,
      ),
    ).rejects.toThrow(/missing 1/);
  });
});

describe("ClientToolBatchesService.findFullyReturnedTransferDocIds", () => {
  let service: ClientToolBatchesService;
  let batchModel: { findAll: jest.Mock };

  beforeEach(() => {
    batchModel = { findAll: jest.fn() };
    service = new ClientToolBatchesService(
      batchModel as any,
      {} as any,
      {} as any,
    );
  });

  it("returns only transfers whose batches sum to zero open qty", async () => {
    batchModel.findAll.mockResolvedValue([
      { transferDocId: "10", openSum: "0", batchCount: "2" },
      { transferDocId: 11, openSum: 0.00005, batchCount: 1 },
      { transferDocId: 12, openSum: 1, batchCount: 1 },
      { transferDocId: 13, openSum: 0, batchCount: 0 },
    ]);

    const closed = await service.findFullyReturnedTransferDocIds([10, 11, 12, 13, 0]);

    expect([...closed].sort((a, b) => a - b)).toEqual([10, 11]);
    const query = batchModel.findAll.mock.calls[0][0];
    expect(query.group).toEqual(["transferDocId"]);
    expect(query.raw).toBe(true);
    expect(query.where.transferDocId[Op.in]).toEqual([10, 11, 12, 13]);
  });

  it("skips the query when there are no transfer ids", async () => {
    const closed = await service.findFullyReturnedTransferDocIds([]);
    expect(closed.size).toBe(0);
    expect(batchModel.findAll).not.toHaveBeenCalled();
  });
});

describe("ClientToolBatchesService.findReceiveDocIdsByTransfer", () => {
  let service: ClientToolBatchesService;
  let consumptionModel: { findAll: jest.Mock };

  beforeEach(() => {
    consumptionModel = { findAll: jest.fn() };
    service = new ClientToolBatchesService(
      {} as any,
      consumptionModel as any,
      {} as any,
    );
  });

  it("groups unique receive documents by transfer", async () => {
    consumptionModel.findAll.mockResolvedValue([
      { receiveDocId: 501, batch: { transferDocId: 10 } },
      { receiveDocId: "501", batch: { transferDocId: "10" } },
      { receiveDocId: 502, batch: { transferDocId: 10 } },
      { receiveDocId: 503, batch: { transferDocId: 11 } },
      { receiveDocId: 0, batch: { transferDocId: 11 } },
    ]);

    const map = await service.findReceiveDocIdsByTransfer([10, 11, 0]);

    expect(map.get(10)?.sort((a, b) => a - b)).toEqual([501, 502]);
    expect(map.get(11)).toEqual([503]);
    const query = consumptionModel.findAll.mock.calls[0][0];
    expect(query.include[0].required).toBe(true);
    expect(query.include[0].where.transferDocId[Op.in]).toEqual([10, 11]);
  });

  it("skips the query when there are no transfer ids", async () => {
    const map = await service.findReceiveDocIdsByTransfer([]);
    expect(map.size).toBe(0);
    expect(consumptionModel.findAll).not.toHaveBeenCalled();
  });
});
