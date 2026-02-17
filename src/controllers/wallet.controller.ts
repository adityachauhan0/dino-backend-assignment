// src/controllers/wallet.controller.ts
import { Request, Response } from "express";
import { WalletService } from "../services/wallet.service";

const walletService = new WalletService();

export class WalletController {
  async getUsers(req: Request, res: Response) {
    try {
      const users = await walletService.getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getBalance(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const balances = await walletService.getBalance(userId as string);
      res.json(balances);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async topUp(req: Request, res: Response) {
    try {
      const { userId, assetCode, amount, idempotencyKey } = req.body;
      const transaction = await walletService.topUp(userId as string, assetCode as string, amount as number, idempotencyKey as string);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async issueBonus(req: Request, res: Response) {
    try {
      const { userId, assetCode, amount, idempotencyKey } = req.body;
      const transaction = await walletService.issueBonus(userId as string, assetCode as string, amount as number, idempotencyKey as string);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async purchase(req: Request, res: Response) {
    try {
      const { userId, assetCode, amount, idempotencyKey } = req.body;
      const transaction = await walletService.purchase(userId as string, assetCode as string, amount as number, idempotencyKey as string);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const transactions = await walletService.getTransactions(userId as string);
      res.json(transactions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
