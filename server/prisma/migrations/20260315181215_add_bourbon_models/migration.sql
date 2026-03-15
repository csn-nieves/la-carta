-- CreateTable
CREATE TABLE "Bourbon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationPurchased" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bourbon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BourbonRating" (
    "id" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "review" TEXT,
    "bourbonId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BourbonRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BourbonReviewReply" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BourbonReviewReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BourbonRating_bourbonId_createdById_key" ON "BourbonRating"("bourbonId", "createdById");

-- AddForeignKey
ALTER TABLE "Bourbon" ADD CONSTRAINT "Bourbon_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BourbonRating" ADD CONSTRAINT "BourbonRating_bourbonId_fkey" FOREIGN KEY ("bourbonId") REFERENCES "Bourbon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BourbonRating" ADD CONSTRAINT "BourbonRating_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BourbonReviewReply" ADD CONSTRAINT "BourbonReviewReply_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "BourbonRating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BourbonReviewReply" ADD CONSTRAINT "BourbonReviewReply_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
