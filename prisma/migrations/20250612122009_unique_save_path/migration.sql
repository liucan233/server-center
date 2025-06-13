/*
  Warnings:

  - A unique constraint covering the columns `[uploadUserId,savePath]` on the table `Upload` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Upload_uploadUserId_savePath_key` ON `Upload`(`uploadUserId`, `savePath`);
