"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const wallet_service_1 = require("../services/wallet.service");
const walletService = new wallet_service_1.WalletService();
class WalletController {
    async getBalance(req, res) {
        try {
            const { userId } = req.params;
            const balances = await walletService.getBalance(userId);
            res.json(balances);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async topUp(req, res) {
        try {
            const { userId, assetCode, amount, idempotencyKey } = req.body;
            const transaction = await walletService.topUp(userId, assetCode, amount, idempotencyKey);
            res.status(201).json(transaction);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async issueBonus(req, res) {
        try {
            const { userId, assetCode, amount, idempotencyKey } = req.body;
            const transaction = await walletService.issueBonus(userId, assetCode, amount, idempotencyKey);
            res.status(201).json(transaction);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async purchase(req, res) {
        try {
            const { userId, assetCode, amount, idempotencyKey } = req.body;
            const transaction = await walletService.purchase(userId, assetCode, amount, idempotencyKey);
            res.status(201).json(transaction);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getTransactions(req, res) {
        try {
            const { userId } = req.params;
            const transactions = await walletService.getTransactions(userId);
            res.json(transactions);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.WalletController = WalletController;
