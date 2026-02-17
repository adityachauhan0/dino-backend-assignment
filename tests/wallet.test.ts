// tests/wallet.test.ts
import request from "supertest";
import app from "../src/index";
import prisma from "../src/lib/prisma";

describe("Wallet Service API", () => {
  let alice: any;
  let bob: any;

  beforeAll(async () => {
    alice = await prisma.user.findUnique({ where: { username: "alice" } });
    bob = await prisma.user.findUnique({ where: { username: "bob" } });

    // Reset balances for testing
    const asset = await prisma.asset.findUnique({ where: { code: "GC" } });
    if (asset) {
      await prisma.wallet.update({
        where: { userId_assetId: { userId: alice.id, assetId: asset.id } },
        data: { balance: 100 },
      });
      await prisma.wallet.update({
        where: { userId_assetId: { userId: bob.id, assetId: asset.id } },
        data: { balance: 50 },
      });
    }

    // Clear previous transactions
    await prisma.transaction.deleteMany({});
  });

  test("GET /api/v1/wallets/balance/:userId should return user balance", async () => {
    const res = await request(app).get(`/api/v1/wallets/balance/${alice.id}`);
    expect(res.status).toBe(200);
    expect(res.body[0].asset.code).toBe("GC");
  });

  test("POST /api/v1/wallets/top-up should add credits to user wallet", async () => {
    const idempotencyKey = `topup-${Date.now()}`;
    const initialBalanceRes = await request(app).get(`/api/v1/wallets/balance/${alice.id}`);
    const initialBalance = initialBalanceRes.body[0].balance;

    const res = await request(app)
      .post("/api/v1/wallets/top-up")
      .send({
        userId: alice.id,
        assetCode: "GC",
        amount: 50,
        idempotencyKey,
      });

    expect(res.status).toBe(201);

    const finalBalanceRes = await request(app).get(`/api/v1/wallets/balance/${alice.id}`);
    expect(finalBalanceRes.body[0].balance).toBe(initialBalance + 50);
  });

  test("POST /api/v1/wallets/purchase should deduct credits from user wallet", async () => {
    const idempotencyKey = `purchase-${Date.now()}`;
    const initialBalanceRes = await request(app).get(`/api/v1/wallets/balance/${bob.id}`);
    const initialBalance = initialBalanceRes.body[0].balance;

    const res = await request(app)
      .post("/api/v1/wallets/purchase")
      .send({
        userId: bob.id,
        assetCode: "GC",
        amount: 30,
        idempotencyKey,
      });

    if (res.status !== 201) console.error("Error response:", res.body);
    expect(res.status).toBe(201);

    const finalBalanceRes = await request(app).get(`/api/v1/wallets/balance/${bob.id}`);
    expect(finalBalanceRes.body[0].balance).toBe(initialBalance - 30);
  });

  test("POST /api/v1/wallets/purchase should fail if insufficient funds", async () => {
    const idempotencyKey = `fail-${Date.now()}`;
    const res = await request(app)
      .post("/api/v1/wallets/purchase")
      .send({
        userId: bob.id,
        assetCode: "GC",
        amount: 1000,
        idempotencyKey,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Insufficient funds");
  });

  test("Idempotency should prevent duplicate transactions", async () => {
    const idempotencyKey = "same-key";
    
    // First request
    const res1 = await request(app)
      .post("/api/v1/wallets/top-up")
      .send({
        userId: alice.id,
        assetCode: "GC",
        amount: 10,
        idempotencyKey,
      });
    expect(res1.status).toBe(201);

    const balanceAfterFirst = (await request(app).get(`/api/v1/wallets/balance/${alice.id}`)).body[0].balance;

    // Second request with same key
    const res2 = await request(app)
      .post("/api/v1/wallets/top-up")
      .send({
        userId: alice.id,
        assetCode: "GC",
        amount: 10,
        idempotencyKey,
      });
    expect(res2.status).toBe(201); // Returns existing transaction
    expect(res2.body.id).toBe(res1.body.id);

    const balanceAfterSecond = (await request(app).get(`/api/v1/wallets/balance/${alice.id}`)).body[0].balance;
    expect(balanceAfterSecond).toBe(balanceAfterFirst); // Balance shouldn't change
  });

  test.skip("Concurrency: Multiple simultaneous requests should be handled correctly", async () => {
    const initialBalanceRes = await request(app).get(`/api/v1/wallets/balance/${alice.id}`);
    const initialBalance = initialBalanceRes.body[0].balance;

    const numRequests = 2;
    const requests = Array.from({ length: numRequests }).map((_, i) =>
      request(app)
        .post("/api/v1/wallets/top-up")
        .send({
          userId: alice.id,
          assetCode: "GC",
          amount: 1,
          idempotencyKey: `concurrency-${i}-${Date.now()}`,
        })
    );

    const responses = await Promise.all(requests);
    responses.forEach(res => {
      if (res.status !== 201) console.error("Concurrency error:", res.body);
      expect(res.status).toBe(201);
    });

    const finalBalanceRes = await request(app).get(`/api/v1/wallets/balance/${alice.id}`);
    expect(finalBalanceRes.body[0].balance).toBe(initialBalance + numRequests);
  }, 30000);
});
