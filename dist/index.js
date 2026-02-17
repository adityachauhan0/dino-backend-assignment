"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const wallet_routes_1 = __importDefault(require("./routes/wallet.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use("/api/v1/wallets", wallet_routes_1.default);
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
if (process.env.NODE_ENV !== "test") {
    app.listen(port, () => {
        console.log(`Wallet Service listening at http://localhost:${port}`);
    });
}
exports.default = app;
