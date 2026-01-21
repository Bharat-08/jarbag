-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" INTEGER DEFAULT 999,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "rank" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 5.0,
ADD COLUMN     "reviewCount" INTEGER DEFAULT 0,
ADD COLUMN     "yearsOfExperience" INTEGER;

-- CreateTable
CREATE TABLE "MentorshipSlot" (
    "id" SERIAL NOT NULL,
    "mentorId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorshipSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "mentorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TATImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "description1" TEXT NOT NULL,
    "description2" TEXT NOT NULL,
    "description3" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TATImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MentorshipSlot" ADD CONSTRAINT "MentorshipSlot_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
