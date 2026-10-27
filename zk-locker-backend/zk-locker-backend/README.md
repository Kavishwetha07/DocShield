# ZK Locker — Backend (FastAPI + PostgreSQL)

Backend for the zero-knowledge public document locker. It stores exactly
what the frontend's `encryptFile()` and `extractMetadata()` produce —
ciphertext, salt, iv, a content hash, and plaintext *metadata* — and never
sees a raw file or an encryption passphrase.

## Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE zk_locker;
   CREATE USER zk_user WITH PASSWORD 'zk_pass';
   GRANT ALL PRIVILEGES ON DATABASE zk_locker TO zk_user;
   ```
2. Copy `.env.example` to `.env` and adjust `DATABASE_URL` / `SECRET_KEY`.
3. Install and run:
   ```bash
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
4. Open `http://127.0.0.1:8000/docs` for interactive API docs (Swagger UI).

Tables are created automatically on startup via `Base.metadata.create_all`.
For anything beyond local development, switch to Alembic migrations
instead (`alembic init` is a natural next step — ask Antigravity to set
it up once the schema stabilizes).

## Auth model — two separate secrets

This is the most important thing to get right when wiring the frontend:

- **Account password** (this backend): proves who you are to the server.
  Hashed with PBKDF2 and stored in `users.hashed_password`. A normal
  username/password login, nothing unusual.
- **Encryption passphrase** (`src/context/VaultContext.jsx` on the
  frontend): derives the AES key that seals/opens documents in the
  browser. **Never sent to this backend, never stored here, in any form.**
  If you reuse the account password as the encryption passphrase for
  convenience, that's a product decision to make consciously — this
  backend has no opinion on it and doesn't enforce either way.

## API summary

| Method | Path                  | Auth | Purpose |
|--------|-----------------------|------|---------|
| POST   | `/auth/register`      | no   | Create account |
| POST   | `/auth/login`         | no   | Get a JWT (`OAuth2PasswordRequestForm`: `username`=email, `password`) |
| POST   | `/folders`             | yes  | Create a folder |
| GET    | `/folders`             | yes  | List folders with document counts |
| DELETE | `/folders/{id}`        | yes  | Delete a folder (and its documents) |
| POST   | `/documents`           | yes  | Upload a sealed document (see body shape below) |
| GET    | `/documents`           | yes  | List, with `?folder_id=`, `?q=filename`, `?tag=` filters |
| GET    | `/documents/{id}`      | yes  | Fetch one sealed document (for client-side decrypt) |
| DELETE | `/documents/{id}`      | yes  | Delete a document |

`POST /documents` body matches what `VaultContext.seal()` already produces:
```json
{
  "id": "9f3a1c...",
  "folderId": "uuid-or-null",
  "sealedPayload": {
    "ciphertext": "base64...",
    "salt": "base64...",
    "iv": "base64...",
    "iterations": 210000,
    "contentHash": "hex sha256",
    "sizeBytes": 20481
  },
  "metadata": {
    "fileName": "marksheet_sem6.pdf",
    "extension": "pdf",
    "category": "Document",
    "mimeType": "application/pdf",
    "tags": ["Marksheet"]
  }
}
```

## Wiring the frontend (`VaultContext.jsx`)

Replace the in-memory `documents` array and the `seal`/`open` functions
with calls to this API:
- `seal(file)` → after `encryptFile()` + `extractMetadata()`, `POST` the
  combined payload to `/documents` (attach `Authorization: Bearer <jwt>`).
- `open(docId)` → `GET /documents/{docId}` to fetch the sealed payload,
  then run the existing `decryptFile()` locally exactly as it does now —
  the server never performs decryption.
- Fetch `/folders` on load instead of keeping folders only in local state.

Ask Antigravity to do this wiring as a scoped task, e.g.: *"Replace the
in-memory store in VaultContext.jsx with fetch calls to the FastAPI
backend at http://localhost:8000, using the endpoints described in the
backend README, and store the JWT from /auth/login in memory."*
