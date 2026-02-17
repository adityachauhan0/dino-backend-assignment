# Dino Ventures: Internal Wallet Service

This project is a high-performance **Internal Wallet Service** developed as part of the backend engineer assignment for **Dino Ventures**. It provides a robust, ledger-based system for managing application-specific credits with strict data integrity and concurrency controls.

---

## 🏗️ Architecture & Philosophy

The service is built on three core pillars:
1.  **Double-Entry Ledger:** Every balance change is recorded as a movement between two wallets (e.g., `SYSTEM_TREASURY` → `USER_WALLET`). This provides a perfect audit trail.
2.  **ACID Transactions:** Utilizing PostgreSQL's ACID properties via Prisma to ensure that ledger entries and balance updates never go out of sync.
3.  **Strict Idempotency:** Every transaction requires a client-side `idempotencyKey`, preventing accidental duplicate charges or credits during network retries.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (v20+)
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (Production) / SQLite (Local/Testing)
- **ORM:** Prisma
- **Testing:** Jest & Supertest
- **Infrastructure:** Docker & Docker Compose

---

## 🚀 Quick Start (Docker)

The fastest way to run the service is using Docker Compose, which spins up the application and a PostgreSQL database.

```bash
# Clone the repository
git clone <repo-url>
cd dino-backend-assignment

# Start the services
docker-compose up --build
```

The system will automatically:
1.  Initialize the PostgreSQL database.
2.  Run all necessary migrations.
3.  Seed initial data (**Assets**: Gold Coins, Diamonds; **Users**: Alice, Bob).
4.  Expose the API on `http://localhost:3000`.

---

## 🧪 End-to-End Testing Scenario

To verify the system is working correctly inside the Docker environment:

### 1. Retrieve Seeded Users
```bash
curl http://localhost:3000/api/v1/wallets/users
```
*Note the `id` of "alice" from the JSON response.*

### 2. Check Initial Balance
```bash
# Replace <USER_ID> with Alice's ID
curl http://localhost:3000/api/v1/wallets/balance/<USER_ID>
```

### 3. Perform a Top-up (Add Credits)
```bash
curl -X POST http://localhost:3000/api/v1/wallets/top-up \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<USER_ID>",
    "assetCode": "GC",
    "amount": 250,
    "idempotencyKey": "unique-key-101"
  }'
```

### 4. Verify Idempotency
Run the same command again. The server will return the **existing** transaction, and the balance will **not** increase again, proving the system's safety.

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/wallets/users` | `GET` | List all seeded users and their IDs |
| `/api/v1/wallets/balance/:userId` | `GET` | Get balance for all assets owned by a user |
| `/api/v1/wallets/transactions/:userId` | `GET` | Get full audit trail for a user |
| `/api/v1/wallets/top-up` | `POST` | Credit user wallet from System Treasury |
| `/api/v1/wallets/bonus` | `POST` | Issue bonus credits to a user |
| `/api/v1/wallets/purchase` | `POST` | Spend credits (User → System Revenue) |

---

## 🛡️ Critical Design Details

### Concurrency Control
Under high load, multiple requests might attempt to modify the same wallet balance. This service uses **Row-Level Locking** (`SELECT ... FOR UPDATE`) in PostgreSQL. This ensures that while one transaction is calculating and updating a balance, all other requests for that specific wallet are queued, preventing race conditions.

### Data Integrity
The `Wallet` table contains a `balance` column for performance, but the source of truth is the `Transaction` ledger. Database constraints are in place to ensure:
- User balances can **never** go negative.
- Idempotency keys are unique across the entire system.

### Testing
A comprehensive test suite is included to verify all functional requirements:
```bash
# Run local tests
npm test
```
The suite includes unit and integration tests for balance checks, top-ups, purchases, insufficient funds handling, and idempotency logic.

---

## 📄 License
This project is submitted for the Dino Ventures Backend Engineering assessment.