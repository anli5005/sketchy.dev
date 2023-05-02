/*
  Warnings:

  - You are about to drop the column `key` on the `PublicKey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[keyId]` on the table `PublicKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyData` to the `PublicKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keyId` to the `PublicKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PublicKey" DROP COLUMN "key",
ADD COLUMN     "keyData" TEXT NOT NULL,
ADD COLUMN     "keyId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PublicKey_keyId_key" ON "PublicKey"("keyId");
