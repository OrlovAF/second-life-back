/*
  Warnings:

  - You are about to drop the column `acceptAllCategories` on the `items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `items` DROP COLUMN `acceptAllCategories`,
    ADD COLUMN `accepted_mode` ENUM('ALL', 'SELECTED') NOT NULL DEFAULT 'ALL';
