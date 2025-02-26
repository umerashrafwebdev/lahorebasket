-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shipping" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "carrier" TEXT,
    "service" TEXT,
    "weight" REAL,
    "length" REAL,
    "width" REAL,
    "height" REAL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shipping_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Shipping" ("address", "carrier", "city", "country", "createdAt", "height", "id", "length", "orderId", "service", "state", "updatedAt", "weight", "width", "zip") SELECT "address", "carrier", "city", "country", "createdAt", "height", "id", "length", "orderId", "service", "state", "updatedAt", "weight", "width", "zip" FROM "Shipping";
DROP TABLE "Shipping";
ALTER TABLE "new_Shipping" RENAME TO "Shipping";
CREATE UNIQUE INDEX "Shipping_orderId_key" ON "Shipping"("orderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
