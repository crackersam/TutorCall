-- CreateTable
CREATE TABLE "MobileToken" (
    "identifier" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobileToken_pkey" PRIMARY KEY ("identifier","token")
);

-- AddForeignKey
ALTER TABLE "MobileToken" ADD CONSTRAINT "MobileToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
