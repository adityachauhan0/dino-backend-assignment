"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/wallet.routes.ts
const express_1 = require("express");
const wallet_controller_1 = require("../controllers/wallet.controller");
const router = (0, express_1.Router)();
const controller = new wallet_controller_1.WalletController();
router.get("/balance/:userId", (req, res) => controller.getBalance(req, res));
router.get("/transactions/:userId", (req, res) => controller.getTransactions(req, res));
router.post("/top-up", (req, res) => controller.topUp(req, res));
router.post("/bonus", (req, res) => controller.issueBonus(req, res));
router.post("/purchase", (req, res) => controller.purchase(req, res));
exports.default = router;
