/*
  Warnings:

  - A unique constraint covering the columns `[tokenSubject]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_tokenSubject_key" ON "User"("tokenSubject");
