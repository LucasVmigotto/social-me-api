/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `SingleUseToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SingleUseToken_token_key" ON "SingleUseToken"("token");
