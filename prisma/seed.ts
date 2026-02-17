// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Asset Types
  const goldCoins = await prisma.asset.upsert({
    where: { code: "GC" },
    update: {},
    create: { name: "Gold Coins", code: "GC" },
  });

  const diamonds = await prisma.asset.upsert({
    where: { code: "DM" },
    update: {},
    create: { name: "Diamonds", code: "DM" },
  });

  console.log("Assets created");

  // 2. System Accounts (as "special" users)
  const treasuryUser = await prisma.user.upsert({
    where: { username: "SYSTEM_TREASURY" },
    update: {},
    create: { username: "SYSTEM_TREASURY", email: "treasury@system.internal" },
  });

  const revenueUser = await prisma.user.upsert({
    where: { username: "SYSTEM_REVENUE" },
    update: {},
    create: { username: "SYSTEM_REVENUE", email: "revenue@system.internal" },
  });

  const treasuryWallet = await prisma.wallet.upsert({
    where: { userId_assetId: { userId: treasuryUser.id, assetId: goldCoins.id } },
    update: {},
    create: {
      userId: treasuryUser.id,
      assetId: goldCoins.id,
      balance: 1000000,
      type: "SYSTEM",
    },
  });

  const revenueWallet = await prisma.wallet.upsert({
    where: { userId_assetId: { userId: revenueUser.id, assetId: goldCoins.id } },
    update: {},
    create: {
      userId: revenueUser.id,
      assetId: goldCoins.id,
      balance: 0,
      type: "SYSTEM",
    },
  });

  console.log("System wallets created");

  // 3. User Accounts
  const alice = await prisma.user.upsert({
    where: { username: "alice" },
    update: {},
    create: { username: "alice", email: "alice@example.com" },
  });

  const bob = await prisma.user.upsert({
    where: { username: "bob" },
    update: {},
    create: { username: "bob", email: "bob@example.com" },
  });

  await prisma.wallet.upsert({
    where: { userId_assetId: { userId: alice.id, assetId: goldCoins.id } },
    update: {},
    create: { userId: alice.id, assetId: goldCoins.id, balance: 100, type: "USER" },
  });

  await prisma.wallet.upsert({
    where: { userId_assetId: { userId: bob.id, assetId: goldCoins.id } },
    update: {},
    create: { userId: bob.id, assetId: goldCoins.id, balance: 50, type: "USER" },
  });

  console.log("User accounts and initial wallets created:");
  console.log(`- alice ID: ${alice.id}`);
  console.log(`- bob ID: ${bob.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });