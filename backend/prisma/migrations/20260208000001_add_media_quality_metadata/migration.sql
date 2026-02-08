-- AlterTable
ALTER TABLE "speech_recordings" ADD COLUMN "audio_sample_rate" INTEGER,
ADD COLUMN "audio_bit_depth" INTEGER,
ADD COLUMN "audio_channels" INTEGER,
ADD COLUMN "audio_codec" TEXT,
ADD COLUMN "video_width" INTEGER,
ADD COLUMN "video_height" INTEGER,
ADD COLUMN "video_frame_rate" DOUBLE PRECISION,
ADD COLUMN "video_codec" TEXT;
