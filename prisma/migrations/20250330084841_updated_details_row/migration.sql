/*
  Warnings:

  - You are about to drop the column `description` on the `CallRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CallRequest" DROP COLUMN "description",
ADD COLUMN     "details" TEXT NOT NULL DEFAULT 'No details provided';
