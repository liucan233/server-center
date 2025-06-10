-- CreateTable
CREATE TABLE `Word` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `spell` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Word_spell_key`(`spell`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordSyllable` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `spidersText` VARCHAR(2048) NOT NULL,
    `wordId` INTEGER NOT NULL,
    `syllable` JSON NOT NULL,

    UNIQUE INDEX `WordSyllable_wordId_key`(`wordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WordSyllable` ADD CONSTRAINT `WordSyllable_wordId_fkey` FOREIGN KEY (`wordId`) REFERENCES `Word`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
