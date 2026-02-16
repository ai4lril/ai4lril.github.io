-- AlterTable
-- Add media_type if it doesn't exist (handles DBs created before this column was in schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'speech_recordings' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE "speech_recordings" ADD COLUMN "media_type" TEXT NOT NULL DEFAULT 'audio';
  END IF;
END $$;
