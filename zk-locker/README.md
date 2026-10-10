# DocShield — Zero-Knowledge Digital Document Locker (Frontend)

Frontend prototype for a **Digital India–compliant, zero-knowledge public
document locker with automated metadata indexing**.

## Stack
- React 18 + React Router (Vite)
- Tailwind CSS (custom token system — see `tailwind.config.js`)
- Web Crypto API (native browser crypto, no external crypto library)

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Where the two core requirements live

**Zero-knowledge encryption** — `src/utils/crypto.js`
- A passphrase is turned into an AES-256 key in-browser via PBKDF2
  (210,000 iterations, SHA-256), never transmitted.
- Files are sealed with AES-GCM; only ciphertext + salt/iv (both
  non-secret) leave the browser context, simulated here by
  `VaultContext`'s in-memory store.
- `sha256Hex` gives every document a public, content-derived fingerprint
  usable as a locker ID without revealing contents.

**Automated metadata indexing** — `src/utils/metadata.js`
- Runs against the file's pre-encryption attributes only (filename,
  extension, size, MIME type).
- Auto-tags common Indian public-document types (Aadhaar, PAN,
  marksheets, land records, etc.) via filename pattern rules — swap this
  for a real OCR/NLP classifier when you have a backend.

## Wiring up a real backend
`src/context/VaultContext.jsx` is the single seam to replace: `seal()`
and `open()` currently read/write an in-memory array. Point them at your
API — the contract to preserve is that only the object returned by
`encryptFile()` (`ciphertext`, `salt`, `iv`, `contentHash`) and the output
of `extractMetadata()` ever get sent over the network. The passphrase and
plaintext file must never leave `seal()`.

## Using this in Antigravity
1. Unzip the project (or copy the `src/` files) into a new workspace.
2. Open the folder in Antigravity and let it detect the Vite/React setup,
   or run `npm install` yourself first.
3. Ask the agent to extend a specific piece — e.g. "wire `VaultContext`
   to a REST backend at `/api/documents`" — rather than "build the app",
   since the scaffold, crypto, and indexing logic are already in place.
4. If you add a real backend, keep the boundary described above: send
   `sealedPayload` + `metadata` only, never the raw `File` or passphrase.

## Suggested next steps
- Persist `documents` (IndexedDB or a real API) so the locker survives
  a refresh — it's in-memory only right now, by design, to keep this
  handoff simple.
- Add multi-device access via a recovery/key-wrapping flow (e.g.
  Shamir's Secret Sharing or a hardware key), since a lost passphrase
  currently means permanent loss, as noted on the unlock screen.
- Replace the filename-based tagger in `metadata.js` with real
  classification once a backend can run it — the frontend contract
  (feed it a `File`, get back a metadata object) stays the same.
