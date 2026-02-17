// src/index.ts
import express from "express";
import dotenv from "dotenv";
import walletRoutes from "./routes/wallet.routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/v1/wallets", walletRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Wallet Service listening at http://localhost:${port}`);
  });
}

export default app;
