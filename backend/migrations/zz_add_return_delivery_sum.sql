ALTER TABLE docvalues ADD COLUMN IF NOT EXISTS "returnDeliverySum" FLOAT;
ALTER TABLE docvalues ADD COLUMN IF NOT EXISTS "deliveryChargedOnTransfer" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE docvalues ADD COLUMN IF NOT EXISTS "partyDeliveryCharged" BOOLEAN NOT NULL DEFAULT FALSE;

-- Уже проведённая доставка передачи не должна потеряться при перепроведении.
UPDATE docvalues dv
SET "deliveryChargedOnTransfer" = TRUE
FROM documents d
WHERE dv."docId" = d.id
  AND d."documentType" = 'TransferToolsToClient'
  AND EXISTS (
    SELECT 1
    FROM entries e
    WHERE e."docId" = d.id
      AND e.description = 'етказиб бериш хақи'
  );

-- На старых возвратах сумма доставки — это плата за рейс «Возврат».
UPDATE docvalues dv
SET "returnDeliverySum" = dv."deliverySum",
    "deliverySum" = NULL
FROM documents d
WHERE dv."docId" = d.id
  AND d."documentType" = 'ReceiveToolsFromClient'
  AND dv."deliverySum" IS NOT NULL
  AND dv."deliverySum" <> 0
  AND (dv."returnDeliverySum" IS NULL OR dv."returnDeliverySum" = 0);
