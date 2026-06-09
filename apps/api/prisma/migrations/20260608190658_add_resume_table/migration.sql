-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "website" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "summary" TEXT,
    "skills" TEXT[],
    "languages" TEXT[],
    "experience" JSONB NOT NULL,
    "education" JSONB NOT NULL,
    "template" TEXT,
    "colorScheme" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resume_documentId_key" ON "Resume"("documentId");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

