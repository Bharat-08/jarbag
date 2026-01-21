/*
  Warnings:

  - The primary key for the `ExamResult` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `details` on the `ExamResult` table. All the data in the column will be lost.
  - You are about to drop the column `examType` on the `ExamResult` table. All the data in the column will be lost.
  - The `id` column on the `ExamResult` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `examName` to the `ExamResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testType` to the `ExamResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExamResult" DROP CONSTRAINT "ExamResult_pkey",
DROP COLUMN "details",
DROP COLUMN "examType",
ADD COLUMN     "examName" TEXT NOT NULL,
ADD COLUMN     "percentage" DOUBLE PRECISION,
ADD COLUMN     "responseDetails" JSONB,
ADD COLUMN     "testType" TEXT NOT NULL,
ADD COLUMN     "total" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id");
