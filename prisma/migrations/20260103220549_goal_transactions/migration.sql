/*
  Warnings:

  - You are about to drop the column `amount` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `reciepts` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `userID` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GoalTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW');

-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "amount",
ADD COLUMN     "limit" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "userID" TEXT NOT NULL,
ALTER COLUMN "currentAmount" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "reciepts",
ADD COLUMN     "receipts" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "userID" TEXT NOT NULL,
ALTER COLUMN "amount" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "PlanType" DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "balance" SET DEFAULT 0.0;

-- CreateTable
CREATE TABLE "GoalTransaction" (
    "id" TEXT NOT NULL,
    "type" "GoalTransactionType" NOT NULL,
    "goalID" TEXT NOT NULL,
    "walletID" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalTransaction" ADD CONSTRAINT "GoalTransaction_goalID_fkey" FOREIGN KEY ("goalID") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalTransaction" ADD CONSTRAINT "GoalTransaction_walletID_fkey" FOREIGN KEY ("walletID") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
