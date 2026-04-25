# MindVault

On-chain AI therapist running on [Ritual Chain](https://ritual.net). Every conversation turn is a Sovereign Agent job — computed inside a TEE, ECIES-encrypted by the executor, settled on-chain. Your secrets never touch the browser.

---

## Architecture

```
frontend (Next.js)
  ├── /chat          — session UI, message composer, async job polling
  ├── /sessions      — session history (reads from harness or router)
  └── /api/secrets   — server-side encryption of LLM credentials

contracts (Foundry)
  ├── MindVaultRouter.sol   — shared router (one pending job per user)
  ├── MindVaultHarness.sol  — per-user router (own async job slot)
  └── MindVaultFactory.sol  — deploys harnesses via deploy()

backend
  └── indexer.ts     — polls AgentResponse events, writes decrypted
                       messages to HuggingFace (optional)
```

**On-chain flow:**

1. User calls `sendMessage(sessionId, agentInput)` on their harness (or the shared router).
2. The contract forwards a raw call to the Sovereign Agent precompile (`0x080C`) with a 23-field ABI payload.
3. The Ritual executor runs the agent inside a TEE, ECIES-encrypts the output, and calls `onSovereignAgentResult` back on the contract.
4. The frontend polls `fulfilled(jobId)` + reads the `AgentResponse` event to display the result.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| pnpm / npm | any |
| [Foundry](https://getfoundry.sh) | latest |
| RITUAL tokens | ≥ 2 RITUAL on the EOA that will sign transactions |

---

## Local Development

### 1. Clone

```bash
git clone https://github.com/0x0dabid/mindvault.git
cd mindvault
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required
NEXT_PUBLIC_ROUTER_ADDRESS=0x...       # deployed MindVaultRouter address
NEXT_PUBLIC_FACTORY_ADDRESS=0x...      # deployed MindVaultFactory address
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=  # from https://cloud.walletconnect.com

# Optional — leave blank to use the public Ritual RPC
NEXT_PUBLIC_RPC_URL=https://rpc.ritualfoundation.org

# Optional — HuggingFace DA for conversation history persistence
HF_TOKEN=hf_...
HF_REPO_ID=your-org/your-private-dataset
```

### 4. Run the dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy Contracts

### 1. Set deployer key

```bash
export PRIVATE_KEY=0x...
```

### 2. Deploy to Ritual Chain

```bash
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url https://rpc.ritualfoundation.org \
  --broadcast \
  --verify
```

The script prints both contract addresses. Copy them into your frontend `.env.local`.

### 3. Fund the shared router (optional — only if using shared router path)

```bash
cast send <ROUTER_ADDRESS> \
  "deposit(uint256)" 50000 \
  --value 2ether \
  --rpc-url https://rpc.ritualfoundation.org \
  --private-key $PRIVATE_KEY
```

> Users who deploy a personal harness (via the "Deploy Harness" UI) fund their **own EOA** balance rather than the router.

---

## Per-User Harness

Each user can deploy a personal `MindVaultHarness` contract via the UI. Benefits:

- **Own async job slot** — no contention with other users on the shared router.
- **Session IDs without address arg** — harness is single-owner, `getSessionIds()` takes no argument.

The factory is deployed at `NEXT_PUBLIC_FACTORY_ADDRESS`. Users call `factory.deploy()` once; the app detects the harness and routes all subsequent calls through it.

---

## Environment Variables Reference

### `frontend/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_ROUTER_ADDRESS` | ✓ | Deployed `MindVaultRouter` address |
| `NEXT_PUBLIC_FACTORY_ADDRESS` | ✓ | Deployed `MindVaultFactory` address |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ✓ | WalletConnect cloud project ID |
| `NEXT_PUBLIC_RPC_URL` | — | Override public Ritual RPC |
| `HF_TOKEN` | — | HuggingFace token (server-side only, never sent to browser) |
| `HF_REPO_ID` | — | HuggingFace private dataset repo (`org/name`) |

### `contracts/.env` (for Foundry scripts)

| Variable | Description |
|----------|-------------|
| `PRIVATE_KEY` | Deployer private key (0x-prefixed) |

---

## Backend Indexer (Optional)

The backend listens for `AgentResponse` events and can mirror decrypted messages to HuggingFace for persistence.

```bash
cd backend
npm install
npm run dev
```

Requires `PRIVATE_KEY` and optionally `HF_TOKEN` / `HF_REPO_ID` in a local `.env`.

---

## Deploying the Frontend

### Vercel (recommended)

```bash
cd frontend
npx vercel --prod
```

Set all `NEXT_PUBLIC_*` vars and `HF_TOKEN` / `HF_REPO_ID` as Vercel environment variables. `HF_TOKEN` is used only in the `/api/secrets` server-side route — it is never bundled into the client.

---

## Security Notes

- **`HF_TOKEN` never reaches the browser.** The `/api/secrets` route encrypts it to the executor's public key server-side. Only the ciphertext is passed on-chain.
- **ECIES nonce length is 12 bytes.** The app sets `ECIES_CONFIG.symmetricNonceLength = 12` (from `eciesjs`) — required for the Ritual executor to decrypt correctly.
- **TEE-verified outputs.** Agent responses are computed inside a TEE and carry a `◈ TEE Verified` badge in the UI.
- **DKMS-encrypted at rest.** Conversation history in HuggingFace DA is DKMS-encrypted by the executor; only the executor can decrypt it on your behalf.

---

## Crisis Resources

MindVault is not a substitute for professional mental health care.

- **988 Suicide & Crisis Lifeline** — call or text `988`
- **Crisis Text Line** — text `HELLO` to `741741`
- **International Association for Suicide Prevention** — https://www.iasp.info/resources/Crisis_Centres/

---

## License

MIT
