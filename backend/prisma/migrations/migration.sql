-- AlterTable
ALTER TABLE "speech_recordings"
ADD COLUMN "media_type" TEXT NOT NULL DEFAULT 'audio';