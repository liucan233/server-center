/*
  Warnings:

  - You are about to drop the column `syllable` on the `WordSyllable` table. All the data in the column will be lost.
  - Added the required column `jsonList` to the `WordSyllable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `WordSyllable` DROP COLUMN `syllable`,
    ADD COLUMN `jsonList` JSON NOT NULL;
