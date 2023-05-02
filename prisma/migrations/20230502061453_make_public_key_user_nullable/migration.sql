-- DropForeignKey
ALTER TABLE "PublicKey" DROP CONSTRAINT "PublicKey_userId_fkey";

-- AlterTable
ALTER TABLE "PublicKey" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PublicKey" ADD CONSTRAINT "PublicKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
