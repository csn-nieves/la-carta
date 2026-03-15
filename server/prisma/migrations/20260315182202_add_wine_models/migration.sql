-- CreateTable
CREATE TABLE "Wine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationPurchased" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WineRating" (
    "id" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "review" TEXT,
    "wineId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WineRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WineReviewReply" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WineReviewReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WineRating_wineId_createdById_key" ON "WineRating"("wineId", "createdById");

-- AddForeignKey
ALTER TABLE "Wine" ADD CONSTRAINT "Wine_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WineRating" ADD CONSTRAINT "WineRating_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WineRating" ADD CONSTRAINT "WineRating_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WineReviewReply" ADD CONSTRAINT "WineReviewReply_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "WineRating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WineReviewReply" ADD CONSTRAINT "WineReviewReply_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
