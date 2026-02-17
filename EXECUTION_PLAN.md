# Execution Plan: Internal Wallet Service

This document outlines the strategy for implementing the Internal Wallet Service for Dino Ventures.

## 1. Technology Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js (REST API)
- **Database:** PostgreSQL (for ACID compliance)
- **ORM:** Prisma (for schema management, migrations, and type safety)
- **Testing:** Jest & Supertest
- **Containerization:** Docker & Docker Compose

## 2. Database Schema (Ledger-Based Architecture)
We will implement a double-entry-inspired ledger system to ensure data integrity and auditability.

- **Users:** `id`, `username`, `email`, `created_at`
- **Assets:** `id`, `name` (e.g., "Gold Coins"), `code` (e.g., "GC"), `created_at`
- **Wallets:** `id`, `user_id` (null for system), `asset_id`, `balance`, `type` (USER, SYSTEM), `created_at`
- **Transactions:** 
    - `id` (UUID)
    - `from_wallet_id` (Reference to Wallets)
    - `to_wallet_id` (Reference to Wallets)
    - `amount` (Decimal)
    - `type` (TOP_UP, BONUS, PURCHASE)
    - `idempotency_key` (Unique constraint to prevent duplicate processing)
    - `metadata` (JSONB for extra info)
    - `created_at`

## 3. Implementation Phases

### Phase 1: Project Setup & Infrastructure
1. Initialize Node.js project with TypeScript.
2. Configure Prisma and define the database schema.
3. Set up Docker Compose for PostgreSQL.
4. Implement the seeding script (`prisma/seed.ts`).

### Phase 2: Core Transaction Logic
1. Create a `WalletService` to handle core logic:
    - **Transaction Atomic Execution:** Use Prisma's `$transaction` to ensure ACID properties.
    - **Concurrency Control:** Use row-level locking (`SELECT ... FOR UPDATE`) to prevent race conditions during balance updates.
    - **Idempotency:** Validate `idempotency_key` before processing any transaction.
2. Implement the three required flows:
    - `topUp`: System Wallet -> User Wallet.
    - `issueBonus`: System Wallet (Bonus Account) -> User Wallet.
    - `purchase`: User Wallet -> System Wallet (Revenue Account).

### Phase 3: API Development
1. `POST /api/v1/wallets/top-up`: Top up user credits.
2. `POST /api/v1/wallets/bonus`: Issue bonus credits.
3. `POST /api/v1/wallets/purchase`: Spend credits.
4. `GET /api/v1/wallets/balance/:userId`: Check balances for a user.
5. `GET /api/v1/wallets/transactions/:userId`: Audit trail for a user.

### Phase 4: Testing & Quality Assurance
1. **Unit Tests:** Test individual service methods.
2. **Integration Tests:** Test API endpoints with a test database.
3. **Concurrency Tests:** Script to simulate multiple simultaneous transactions for the same user to ensure no race conditions or negative balances occur.

### Phase 5: Containerization & Documentation
1. Create `Dockerfile` and `docker-compose.yml`.
2. Write `README.md` with setup instructions, architectural choices, and API documentation.

## 4. Addressing Critical Constraints

### Concurrency & Race Conditions
- Use PostgreSQL's row-level locking within transactions. When a transaction starts, it will lock the involved wallets' rows to ensure no other process can modify the balance until the transaction completes.

### Idempotency
- Every transaction request must include a client-provided `idempotency_key`. The service will check the `Transactions` table; if a record with that key already exists, it will return the existing result instead of re-processing.

### Data Integrity
- The balance in the `Wallets` table will always be derived from/synchronized with the `Transactions` ledger. We will use a database-level constraint to ensure `balance >= 0` for user wallets.

## 5. Timeline (Estimated)
1. **Setup & Seeding:** 0.5 hours
2. **Core Logic & Transactions:** 1.5 hours
3. **API & Validation:** 1 hour
4. **Testing (especially Concurrency):** 1 hour
5. **Docker & Docs:** 0.5 hours
