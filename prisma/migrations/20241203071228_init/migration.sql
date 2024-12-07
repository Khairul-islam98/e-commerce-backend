-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "image" TEXT[] DEFAULT ARRAY[]::TEXT[];
