"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
// src/services/wallet.service.ts
const prisma_1 = __importDefault(require("../lib/prisma"));
// Assuming TransactionType is an enum if I used it, but I used string in schema.
// Let's just use literals.
class WalletService {
    async getBalance(userId) {
        return prisma_1.default.wallet.findMany({
            where: { userId },
            include: { asset: true },
        });
    }
    async getTransactions(userId) {
        const wallets = await prisma_1.default.wallet.findMany({
            where: { userId },
            select: { id: true },
        });
        const walletIds = wallets.map((w) => w.id);
        return prisma_1.default.transaction.findMany({
            where: {
                OR: [
                    { fromWalletId: { in: walletIds } },
                    { toWalletId: { in: walletIds } },
                ],
            },
            orderBy: { createdAt: "desc" },
        });
    }
    /**
     * Executes a transaction between two wallets with ACID guarantees and idempotency.
     */
    async executeTransaction(fromWalletId, toWalletId, amount, type, idempotencyKey, metadata) {
        if (amount <= 0)
            throw new Error("Amount must be positive");
        return prisma_1.default.$transaction(async (tx) => {
            // 1. Check for existing transaction (Idempotency)
            const existing = await tx.transaction.findUnique({
                where: { idempotencyKey },
            });
            if (existing)
                return existing;
            // 2. Lock and Get Wallets (Concurrency control)
            // Note: SQLite doesn't support SELECT FOR UPDATE, but Prisma's transaction handles locking.
            // In Postgres, we would use: await tx.$executeRaw`SELECT * FROM "Wallet" WHERE "id" IN (${fromWalletId}, ${toWalletId}) FOR UPDATE`;
            const fromWallet = await tx.wallet.findUnique({ where: { id: fromWalletId } });
            const toWallet = await tx.wallet.findUnique({ where: { id: toWalletId } });
            if (!fromWallet || !toWallet)
                throw new Error("One or both wallets not found");
            // 3. Balance Validation (for non-system accounts)
            if (fromWallet.type === "USER" && fromWallet.balance < amount) {
                throw new Error("Insufficient funds");
            }
            // 4. Update Balances
            await tx.wallet.update({
                where: { id: fromWalletId },
                data: { balance: { decrement: amount } },
            });
            await tx.wallet.update({
                where: { id: toWalletId },
                data: { balance: { increment: amount } },
            });
            // 5. Record Transaction Ledger
            const transaction = await tx.transaction.create({
                data: {
                    fromWalletId,
                    toWalletId,
                    amount,
                    type,
                    idempotencyKey,
                    metadata: metadata ? JSON.stringify(metadata) : null,
                },
            });
            return transaction;
        });
    }
    async topUp(userId, assetCode, amount, idempotencyKey) {
        const asset = await prisma_1.default.asset.findUnique({ where: { code: assetCode } });
        if (!asset)
            throw new Error("Asset not found");
        const systemUser = await prisma_1.default.user.findUnique({ where: { username: "SYSTEM_TREASURY" } });
        if (!systemUser)
            throw new Error("System treasury not found");
        const systemWallet = await prisma_1.default.wallet.findUnique({
            where: { userId_assetId: { userId: systemUser.id, assetId: asset.id } },
        });
        const userWallet = await prisma_1.default.wallet.findUnique({
            where: { userId_assetId: { userId, assetId: asset.id } },
        });
        if (!systemWallet || !userWallet)
            throw new Error("Wallet not found");
        return this.executeTransaction(systemWallet.id, userWallet.id, amount, "TOP_UP", idempotencyKey);
    }
    async issueBonus(userId, assetCode, amount, idempotencyKey) {
        const asset = await prisma_1.default.asset.findUnique({ where: { code: assetCode } });
        if (!asset)
            throw new Error("Asset not found");
        const systemUser = await prisma_1.default.user.findUnique({ where: { username: "SYSTEM_TREASURY" } });
        if (!systemUser)
            throw new Error("System treasury not found");
        const systemWallet = await prisma_1.default.wallet.findUnique({
            where: { userId_assetId: { userId: systemUser.id, assetId: asset.id } },
        });
        const userWallet = await prisma_1.default.wallet.findUnique({
            where: { userId_assetId: { userId, assetId: asset.id } },
        });
        if (!systemWallet || !userWallet)
            throw new Error("Wallet not found");
        return this.executeTransaction(systemWallet.id, userWallet.id, amount, "BONUS", idempotencyKey);
    }
    async purchase(userId, assetCode, amount, idempotencyKey) {
        const asset = await prisma_1.default.asset.findUnique({ where: { code: assetCode } });
        if (!asset)
            throw new Error("Asset not found");
        const systemUser = await prisma_1.default.user.findUnique({ where: { username: "SYSTEM_REVENUE" } });
        if (!systemUser)
            throw new Error("System revenue not found");
        const systemWallet = await prisma_1.default.wallet.findUnique({
            where: { userId_assetId: { userId: systemUser.id, assetId: asset.id } },
        });
        const userWallet = await prisma_1.default.wallet.findUnique({
            where: { userId_assetId: { userId, assetId: asset.id } },
        });
        if (!systemWallet || !userWallet)
            throw new Error("Wallet not found");
        return this.executeTransaction(userWallet.id, systemWallet.id, amount, "PURCHASE", idempotencyKey);
    }
}
exports.WalletService = WalletService;
