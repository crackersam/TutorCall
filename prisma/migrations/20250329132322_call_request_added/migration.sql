-- CreateTable
CREATE TABLE "CallRequest" (
    "callRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT 'No description',
    "date1" TIMESTAMP(3) NOT NULL,
    "date2" TIMESTAMP(3) NOT NULL,
    "date3" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallRequest_pkey" PRIMARY KEY ("callRequestId")
);

-- AddForeignKey
ALTER TABLE "CallRequest" ADD CONSTRAINT "CallRequest_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallRequest" ADD CONSTRAINT "CallRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
