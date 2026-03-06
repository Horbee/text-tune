-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_corrections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "original" TEXT NOT NULL,
    "corrected" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "modelName" TEXT NOT NULL DEFAULT 'text-tune-ai-prev-gen',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_corrections" ("corrected", "createdAt", "id", "original", "prompt") SELECT "corrected", "createdAt", "id", "original", "prompt" FROM "corrections";
DROP TABLE "corrections";
ALTER TABLE "new_corrections" RENAME TO "corrections";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
