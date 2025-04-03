/*
  Warnings:

  - You are about to drop the column `userId` on the `CallRequest` table. All the data in the column will be lost.
  - Added the required column `studentId` to the `CallRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CallRequest" DROP CONSTRAINT "CallRequest_userId_fkey";

-- AlterTable
ALTER TABLE "CallRequest" DROP COLUMN "userId",
ADD COLUMN     "studentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CallRequest" ADD CONSTRAINT "CallRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
