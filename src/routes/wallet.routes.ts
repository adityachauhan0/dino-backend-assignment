// src/routes/wallet.routes.ts
import { Router } from "express";
import { WalletController } from "../controllers/wallet.controller";

const router = Router();
const controller = new WalletController();

router.get("/users", (req, res) => controller.getUsers(req, res));
router.get("/balance/:userId", (req, res) => controller.getBalance(req, res));
router.get("/transactions/:userId", (req, res) => controller.getTransactions(req, res));

router.post("/top-up", (req, res) => controller.topUp(req, res));
router.post("/bonus", (req, res) => controller.issueBonus(req, res));
router.post("/purchase", (req, res) => controller.purchase(req, res));

export default router;
