/*
  Warnings:

  - A unique constraint covering the columns `[pronounceId]` on the table `WordSyllable` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pronounceId` to the `WordSyllable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Word` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `WordSyllable` ADD COLUMN `pronounceId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `WordSyllable_pronounceId_key` ON `WordSyllable`(`pronounceId`);

-- AddForeignKey
ALTER TABLE `WordSyllable` ADD CONSTRAINT `WordSyllable_pronounceId_fkey` FOREIGN KEY (`pronounceId`) REFERENCES `Upload`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
