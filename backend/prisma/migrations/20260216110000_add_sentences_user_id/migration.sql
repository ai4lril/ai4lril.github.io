-- AlterTable
ALTER TABLE "sentences" ADD COLUMN "user_id" TEXT;

-- CreateIndex
CREATE INDEX "sentences_user_id_idx" ON "sentences"("user_id");

-- AddForeignKey
ALTER TABLE "sentences" ADD CONSTRAINT "sentences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
