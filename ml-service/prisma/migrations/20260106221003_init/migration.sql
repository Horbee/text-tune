-- CreateTable
CREATE TABLE "corrections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "original" TEXT NOT NULL,
    "corrected" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
