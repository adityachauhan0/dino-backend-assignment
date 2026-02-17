// src/index.ts
import express from "express";
import dotenv from "dotenv";
import walletRoutes from "./routes/wallet.routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <h1>Dino Ventures: Internal Wallet Service</h1>
    <p>The service is live and healthy.</p>
    <ul>
      <li>API Base: <code>/api/v1/wallets</code></li>
      <li>Check Users: <a href="/api/v1/wallets/users">/api/v1/wallets/users</a></li>
      <li>Health Check: <a href="/health">/health</a></li>
    </ul>
    <p>Refer to the <a href="https://github.com/adityachauhan0/dino-backend-assignment">GitHub README</a> for API usage instructions.</p>
  `);
});

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
