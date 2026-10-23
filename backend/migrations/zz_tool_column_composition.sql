CREATE TABLE IF NOT EXISTS tool_components (
    id BIGSERIAL PRIMARY KEY,
    "parentReferenceId" INTEGER NOT NULL,
    "componentReferenceId" INTEGER NOT NULL,
    qty DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS tool_components_parent_component_uidx
    ON tool_components ("parentReferenceId", "componentReferenceId");

CREATE INDEX IF NOT EXISTS tool_components_parent_idx
    ON tool_components ("parentReferenceId");

ALTER TABLE doctableitems ADD COLUMN IF NOT EXISTS "billingRole" VARCHAR(32);
ALTER TABLE doctableitems ADD COLUMN IF NOT EXISTS "assemblyRowKey" VARCHAR(64);
ALTER TABLE doctableitems ADD COLUMN IF NOT EXISTS "normQty" DOUBLE PRECISION;
ALTER TABLE doctableitems ADD COLUMN IF NOT EXISTS "sourceBatchId" BIGINT;

ALTER TABLE client_tool_open_batches ADD COLUMN IF NOT EXISTS "billingRole" VARCHAR(32) NOT NULL DEFAULT 'PLAIN';
ALTER TABLE client_tool_open_batches ADD COLUMN IF NOT EXISTS "assemblyBatchId" BIGINT;
ALTER TABLE client_tool_open_batches ADD COLUMN IF NOT EXISTS "normQty" DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS client_tool_open_batches_assembly_idx
    ON client_tool_open_batches ("assemblyBatchId")
    WHERE "assemblyBatchId" IS NOT NULL;
