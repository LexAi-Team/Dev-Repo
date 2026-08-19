-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Citizen', 'Advocate');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('Pending', 'Verified', 'NotVerified');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('Draft', 'Saved', 'UnderReview');

-- CreateEnum
CREATE TYPE "ListType" AS ENUM ('Required_Document', 'Evidence');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('Uploaded', 'Downloaded', 'Expired');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Advocate" (
    "advocate_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "bar_council_id" TEXT NOT NULL,
    "practice_area" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'Pending',

    CONSTRAINT "Advocate_pkey" PRIMARY KEY ("advocate_id")
);

-- CreateTable
CREATE TABLE "Case" (
    "case_id" SERIAL NOT NULL,
    "citizen_id" INTEGER NOT NULL,
    "advocate_id" INTEGER,
    "category" TEXT NOT NULL,
    "sub_issue" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'Draft',
    "ai_summary" TEXT,
    "procedure_guide" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("case_id")
);

-- CreateTable
CREATE TABLE "CaseQuestionsAnswers" (
    "qa_id" SERIAL NOT NULL,
    "case_id" INTEGER NOT NULL,
    "question_key" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "answer_value" TEXT NOT NULL,

    CONSTRAINT "CaseQuestionsAnswers_pkey" PRIMARY KEY ("qa_id")
);

-- CreateTable
CREATE TABLE "Document" (
    "document_id" SERIAL NOT NULL,
    "case_id" INTEGER NOT NULL,
    "uploaded_by" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "status" "DocumentStatus" NOT NULL DEFAULT 'Uploaded',

    CONSTRAINT "Document_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "checklist_item_id" SERIAL NOT NULL,
    "case_id" INTEGER NOT NULL,
    "list_type" "ListType" NOT NULL,
    "item_label" TEXT NOT NULL,
    "is_collected" BOOLEAN NOT NULL DEFAULT false,
    "linked_document_id" INTEGER,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("checklist_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Advocate_user_id_key" ON "Advocate"("user_id");

-- AddForeignKey
ALTER TABLE "Advocate" ADD CONSTRAINT "Advocate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "Advocate"("advocate_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseQuestionsAnswers" ADD CONSTRAINT "CaseQuestionsAnswers_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "Case"("case_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "Case"("case_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "Case"("case_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_linked_document_id_fkey" FOREIGN KEY ("linked_document_id") REFERENCES "Document"("document_id") ON DELETE SET NULL ON UPDATE CASCADE;
