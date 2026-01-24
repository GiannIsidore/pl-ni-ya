-- AlterTable
ALTER TABLE `blog` ADD COLUMN `authorId` VARCHAR(191) NULL,
    ADD COLUMN `categoryId` INTEGER NULL,
    ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `publishedAt` DATETIME(3) NULL,
    ADD COLUMN `readTime` INTEGER NULL,
    ADD COLUMN `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `thread` ADD COLUMN `isLocked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isPinned` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `status` ENUM('OPEN', 'CLOSED', 'RESOLVED') NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `banReason` TEXT NULL,
    ADD COLUMN `bannedAt` DATETIME(3) NULL,
    ADD COLUMN `bannedBy` VARCHAR(191) NULL,
    ADD COLUMN `bannedUntil` DATETIME(3) NULL,
    ADD COLUMN `isBanned` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `role` ENUM('USER', 'MODERATOR', 'ADMIN') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `Tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Tag_name_key`(`name`),
    UNIQUE INDEX `Tag_slug_key`(`slug`),
    INDEX `Tag_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(191) NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogTag` (
    `blogId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,

    INDEX `BlogTag_blogId_idx`(`blogId`),
    INDEX `BlogTag_tagId_idx`(`tagId`),
    PRIMARY KEY (`blogId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(191) NOT NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `performedBy` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_performedBy_idx`(`performedBy`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    INDEX `AuditLog_targetType_targetId_idx`(`targetType`, `targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Blog_categoryId_idx` ON `Blog`(`categoryId`);

-- CreateIndex
CREATE INDEX `Blog_authorId_idx` ON `Blog`(`authorId`);

-- CreateIndex
CREATE INDEX `Blog_status_idx` ON `Blog`(`status`);

-- CreateIndex
CREATE INDEX `Blog_publishedAt_idx` ON `Blog`(`publishedAt`);

-- CreateIndex
CREATE INDEX `Blog_isFeatured_idx` ON `Blog`(`isFeatured`);

-- CreateIndex
CREATE INDEX `Thread_status_idx` ON `Thread`(`status`);

-- CreateIndex
CREATE INDEX `Thread_isLocked_idx` ON `Thread`(`isLocked`);

-- CreateIndex
CREATE INDEX `Thread_isPinned_idx` ON `Thread`(`isPinned`);

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- CreateIndex
CREATE INDEX `User_isBanned_idx` ON `User`(`isBanned`);

-- AddForeignKey
ALTER TABLE `Blog` ADD CONSTRAINT `Blog_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Blog` ADD CONSTRAINT `Blog_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogTag` ADD CONSTRAINT `BlogTag_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `Blog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogTag` ADD CONSTRAINT `BlogTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_performedBy_fkey` FOREIGN KEY (`performedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
