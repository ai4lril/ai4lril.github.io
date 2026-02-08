-- AlterTable
ALTER TABLE "users" ADD COLUMN     "birthplace_pincode" TEXT,
ADD COLUMN     "birthplace_village_city" TEXT,
ADD COLUMN     "current_residence_village_city" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "mother" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "workplace_college_pincode" TEXT,
ADD COLUMN     "workplace_college_village_city" TEXT;

-- CreateTable
CREATE TABLE "sentences" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "language_code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "difficulty" TEXT,
    "task_type" TEXT NOT NULL,
    "valid" BOOLEAN,
    "citation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sentences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_mappings" (
    "id" TEXT NOT NULL,
    "src_sentence_id" TEXT NOT NULL,
    "tgt_sentence_id" TEXT NOT NULL,
    "user_id" TEXT,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speech_recordings" (
    "id" TEXT NOT NULL,
    "sentence_id" TEXT NOT NULL,
    "user_id" TEXT,
    "audio_file" TEXT NOT NULL,
    "audio_format" TEXT NOT NULL,
    "duration" DOUBLE PRECISION,
    "file_size" INTEGER,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "speech_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_submissions" (
    "id" TEXT NOT NULL,
    "sentence_id" TEXT NOT NULL,
    "user_id" TEXT,
    "submitted_text" TEXT NOT NULL,
    "language_code" TEXT NOT NULL,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "valid" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ner_results" (
    "id" TEXT NOT NULL,
    "sentence_id" TEXT NOT NULL,
    "user_id" TEXT,
    "entities" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "language_code" TEXT NOT NULL,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ner_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_results" (
    "id" TEXT NOT NULL,
    "sentence_id" TEXT NOT NULL,
    "user_id" TEXT,
    "tokens" JSONB NOT NULL,
    "language_code" TEXT NOT NULL,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_results" (
    "id" TEXT NOT NULL,
    "sentence_id" TEXT NOT NULL,
    "user_id" TEXT,
    "source_language" TEXT NOT NULL,
    "target_language" TEXT NOT NULL,
    "original_text" TEXT NOT NULL,
    "translated_text" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentiment_results" (
    "id" TEXT NOT NULL,
    "sentence_id" TEXT,
    "user_id" TEXT,
    "text" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "language_code" TEXT NOT NULL,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sentiment_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emotion_results" (
    "id" TEXT NOT NULL,
    "sentence_id" TEXT,
    "user_id" TEXT,
    "text" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "language_code" TEXT NOT NULL,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emotion_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" TEXT NOT NULL,
    "metric_type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admin_user_id" TEXT,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "user_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admin_user_id" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ner_annotations" (
    "id" TEXT NOT NULL,
    "sentence_id" TEXT NOT NULL,
    "user_id" TEXT,
    "annotations" JSONB NOT NULL,
    "language_code" TEXT NOT NULL,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ner_annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "feature_type" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validations" (
    "id" TEXT NOT NULL,
    "speech_recording_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentence_validations" (
    "id" TEXT NOT NULL,
    "sentence_id" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentence_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_validations" (
    "id" TEXT NOT NULL,
    "question_submission_id" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_metadata" (
    "id" TEXT NOT NULL,
    "speech_recording_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "blob_storage_link" TEXT NOT NULL,
    "audio_duration" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "language_code" TEXT NOT NULL,
    "gender" TEXT,
    "age_group" TEXT,
    "region" TEXT,
    "state" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataset_categories" (
    "id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "positive_vote_count" INTEGER NOT NULL DEFAULT 0,
    "vote_percentage" DOUBLE PRECISION NOT NULL,
    "categorized_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dataset_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcription_reviews" (
    "id" TEXT NOT NULL,
    "speech_recording_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "transcription_text" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transcription_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_recordings" (
    "id" TEXT NOT NULL,
    "question_submission_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "audio_file" TEXT NOT NULL,
    "audio_format" TEXT NOT NULL,
    "duration" DOUBLE PRECISION,
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answer_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sentences_language_code_idx" ON "sentences"("language_code");

-- CreateIndex
CREATE INDEX "sentences_task_type_idx" ON "sentences"("task_type");

-- CreateIndex
CREATE INDEX "sentences_valid_idx" ON "sentences"("valid");

-- CreateIndex
CREATE INDEX "sentences_is_active_idx" ON "sentences"("is_active");

-- CreateIndex
CREATE INDEX "sentences_created_at_idx" ON "sentences"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "translation_mappings_src_sentence_id_tgt_sentence_id_user_i_key" ON "translation_mappings"("src_sentence_id", "tgt_sentence_id", "user_id");

-- CreateIndex
CREATE INDEX "speech_recordings_sentence_id_idx" ON "speech_recordings"("sentence_id");

-- CreateIndex
CREATE INDEX "speech_recordings_user_id_idx" ON "speech_recordings"("user_id");

-- CreateIndex
CREATE INDEX "speech_recordings_is_validated_idx" ON "speech_recordings"("is_validated");

-- CreateIndex
CREATE INDEX "speech_recordings_created_at_idx" ON "speech_recordings"("created_at");

-- CreateIndex
CREATE INDEX "question_submissions_language_code_idx" ON "question_submissions"("language_code");

-- CreateIndex
CREATE INDEX "question_submissions_valid_idx" ON "question_submissions"("valid");

-- CreateIndex
CREATE INDEX "question_submissions_is_validated_idx" ON "question_submissions"("is_validated");

-- CreateIndex
CREATE INDEX "question_submissions_created_at_idx" ON "question_submissions"("created_at");

-- CreateIndex
CREATE INDEX "ner_annotations_sentence_id_idx" ON "ner_annotations"("sentence_id");

-- CreateIndex
CREATE INDEX "ner_annotations_user_id_idx" ON "ner_annotations"("user_id");

-- CreateIndex
CREATE INDEX "ner_annotations_language_code_idx" ON "ner_annotations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_email_idx" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_role_idx" ON "admin_users"("role");

-- CreateIndex
CREATE INDEX "admin_users_is_active_idx" ON "admin_users"("is_active");

-- CreateIndex
CREATE INDEX "user_progress_user_id_idx" ON "user_progress"("user_id");

-- CreateIndex
CREATE INDEX "user_progress_resource_type_idx" ON "user_progress"("resource_type");

-- CreateIndex
CREATE INDEX "user_progress_feature_type_idx" ON "user_progress"("feature_type");

-- CreateIndex
CREATE INDEX "user_progress_completed_at_idx" ON "user_progress"("completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_user_id_resource_type_resource_id_feature_typ_key" ON "user_progress"("user_id", "resource_type", "resource_id", "feature_type");

-- CreateIndex
CREATE INDEX "validations_speech_recording_id_idx" ON "validations"("speech_recording_id");

-- CreateIndex
CREATE INDEX "validations_user_id_idx" ON "validations"("user_id");

-- CreateIndex
CREATE INDEX "validations_created_at_idx" ON "validations"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "validations_speech_recording_id_user_id_key" ON "validations"("speech_recording_id", "user_id");

-- CreateIndex
CREATE INDEX "sentence_validations_sentence_id_idx" ON "sentence_validations"("sentence_id");

-- CreateIndex
CREATE INDEX "sentence_validations_admin_user_id_idx" ON "sentence_validations"("admin_user_id");

-- CreateIndex
CREATE INDEX "sentence_validations_valid_idx" ON "sentence_validations"("valid");

-- CreateIndex
CREATE INDEX "question_validations_question_submission_id_idx" ON "question_validations"("question_submission_id");

-- CreateIndex
CREATE INDEX "question_validations_admin_user_id_idx" ON "question_validations"("admin_user_id");

-- CreateIndex
CREATE INDEX "question_validations_valid_idx" ON "question_validations"("valid");

-- CreateIndex
CREATE UNIQUE INDEX "audio_metadata_speech_recording_id_key" ON "audio_metadata"("speech_recording_id");

-- CreateIndex
CREATE INDEX "audio_metadata_user_id_idx" ON "audio_metadata"("user_id");

-- CreateIndex
CREATE INDEX "audio_metadata_language_code_idx" ON "audio_metadata"("language_code");

-- CreateIndex
CREATE INDEX "audio_metadata_gender_idx" ON "audio_metadata"("gender");

-- CreateIndex
CREATE INDEX "audio_metadata_age_group_idx" ON "audio_metadata"("age_group");

-- CreateIndex
CREATE INDEX "audio_metadata_region_idx" ON "audio_metadata"("region");

-- CreateIndex
CREATE INDEX "audio_metadata_state_idx" ON "audio_metadata"("state");

-- CreateIndex
CREATE INDEX "audio_metadata_timestamp_idx" ON "audio_metadata"("timestamp");

-- CreateIndex
CREATE INDEX "dataset_categories_resource_type_idx" ON "dataset_categories"("resource_type");

-- CreateIndex
CREATE INDEX "dataset_categories_resource_id_idx" ON "dataset_categories"("resource_id");

-- CreateIndex
CREATE INDEX "dataset_categories_category_idx" ON "dataset_categories"("category");

-- CreateIndex
CREATE INDEX "dataset_categories_categorized_at_idx" ON "dataset_categories"("categorized_at");

-- CreateIndex
CREATE INDEX "transcription_reviews_speech_recording_id_idx" ON "transcription_reviews"("speech_recording_id");

-- CreateIndex
CREATE INDEX "transcription_reviews_user_id_idx" ON "transcription_reviews"("user_id");

-- CreateIndex
CREATE INDEX "transcription_reviews_is_approved_idx" ON "transcription_reviews"("is_approved");

-- CreateIndex
CREATE INDEX "transcription_reviews_created_at_idx" ON "transcription_reviews"("created_at");

-- CreateIndex
CREATE INDEX "answer_recordings_question_submission_id_idx" ON "answer_recordings"("question_submission_id");

-- CreateIndex
CREATE INDEX "answer_recordings_user_id_idx" ON "answer_recordings"("user_id");

-- CreateIndex
CREATE INDEX "answer_recordings_created_at_idx" ON "answer_recordings"("created_at");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- AddForeignKey
ALTER TABLE "translation_mappings" ADD CONSTRAINT "translation_mappings_src_sentence_id_fkey" FOREIGN KEY ("src_sentence_id") REFERENCES "sentences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_mappings" ADD CONSTRAINT "translation_mappings_tgt_sentence_id_fkey" FOREIGN KEY ("tgt_sentence_id") REFERENCES "sentences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speech_recordings" ADD CONSTRAINT "speech_recordings_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_submissions" ADD CONSTRAINT "question_submissions_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ner_results" ADD CONSTRAINT "ner_results_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ner_results" ADD CONSTRAINT "ner_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_results" ADD CONSTRAINT "pos_results_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_results" ADD CONSTRAINT "pos_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_results" ADD CONSTRAINT "translation_results_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_results" ADD CONSTRAINT "translation_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentiment_results" ADD CONSTRAINT "sentiment_results_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentiment_results" ADD CONSTRAINT "sentiment_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emotion_results" ADD CONSTRAINT "emotion_results_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emotion_results" ADD CONSTRAINT "emotion_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ner_annotations" ADD CONSTRAINT "ner_annotations_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ner_annotations" ADD CONSTRAINT "ner_annotations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_speech_recording_id_fkey" FOREIGN KEY ("speech_recording_id") REFERENCES "speech_recordings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentence_validations" ADD CONSTRAINT "sentence_validations_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentence_validations" ADD CONSTRAINT "sentence_validations_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_validations" ADD CONSTRAINT "question_validations_question_submission_id_fkey" FOREIGN KEY ("question_submission_id") REFERENCES "question_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_validations" ADD CONSTRAINT "question_validations_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_metadata" ADD CONSTRAINT "audio_metadata_speech_recording_id_fkey" FOREIGN KEY ("speech_recording_id") REFERENCES "speech_recordings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_metadata" ADD CONSTRAINT "audio_metadata_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcription_reviews" ADD CONSTRAINT "transcription_reviews_speech_recording_id_fkey" FOREIGN KEY ("speech_recording_id") REFERENCES "speech_recordings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcription_reviews" ADD CONSTRAINT "transcription_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_recordings" ADD CONSTRAINT "answer_recordings_question_submission_id_fkey" FOREIGN KEY ("question_submission_id") REFERENCES "question_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_recordings" ADD CONSTRAINT "answer_recordings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
