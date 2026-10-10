// Zero-knowledge crypto core.
//
// Design intent: the server (or, in this demo, our mock storage layer) must
// NEVER see plaintext file bytes or the passphrase used to protect them.
// Every document is encrypted in the browser with a key derived from the
// user's passphrase via PBKDF2, using AES-256-GCM for authenticated
// encryption. Only ciphertext + non-secret parameters (salt, iv, iteration
// count) are ever "uploaded".

const PBKDF2_ITERATIONS = 210_000
const KEY_LENGTH = 256

function bufToBase64(buf) {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function base64ToBuf(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

async function deriveKey(passphrase, saltBytes) {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

// SHA-256 content hash — used both as an integrity check and as the
// document's public locker ID, so two identical files always resolve to the
// same fingerprint without revealing their contents.
export async function sha256Hex(arrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', arrayBuffer)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function encryptFile(file, passphrase) {
  const plainBuf = await file.arrayBuffer()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt)

  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plainBuf)
  const contentHash = await sha256Hex(plainBuf)

  return {
    ciphertext: bufToBase64(cipherBuf),
    salt: bufToBase64(salt),
    iv: bufToBase64(iv),
    iterations: PBKDF2_ITERATIONS,
    contentHash,
    sizeBytes: file.size
  }
}

export async function decryptFile(sealedDoc, passphrase) {
  const salt = new Uint8Array(base64ToBuf(sealedDoc.salt))
  const iv = new Uint8Array(base64ToBuf(sealedDoc.iv))
  const key = await deriveKey(passphrase, salt)
  const cipherBuf = base64ToBuf(sealedDoc.ciphertext)

  // Throws if the passphrase is wrong — GCM's auth tag fails to verify,
  // which is exactly the "zero-knowledge" guarantee we want: the server
  // holds ciphertext it cannot open, and a wrong key cannot open it either.
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBuf)
  return plainBuf
}
