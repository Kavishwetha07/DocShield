// Automated metadata indexing.
//
// Because the locker is zero-knowledge, the indexer can only ever work with
// what's visible BEFORE encryption (filename, size, MIME type) or with
// non-reversible fingerprints (the content hash). This mirrors a real
// compliant system: the index that powers search/retrieval must not leak
// document contents.

const DOC_TYPE_RULES = [
  { tag: 'Aadhaar', test: /aadhaar|uid/i },
  { tag: 'PAN', test: /\bpan\b/i },
  { tag: 'Marksheet', test: /marksheet|grade|transcript/i },
  { tag: 'Certificate', test: /certificate|certi|cert\b/i },
  { tag: 'Land Record', test: /land|patta|khata|7\/12/i },
  { tag: 'Income Proof', test: /income|salary|itr/i },
  { tag: 'Medical', test: /medical|health|prescription/i },
  { tag: 'Legal', test: /affidavit|agreement|contract|deed/i },
  { tag: 'Identity', test: /passport|voter|license|licence/i }
]

const CATEGORY_RULES = [
  { category: 'Community', test: /community|caste|\bbc\b|\bmbc\b|\bobc\b|\bsc\b|\bst\b/i },
  { category: 'Income', test: /income|salary|itr|tax/i },
  { category: 'Identity', test: /aadhaar|aadhar|pan|passport|voter|voterid|drivinglicense|drivinglicence/i },
  { category: 'Education', test: /marksheet|mark_sheet|semester|degree|bonafide|certificate|transfercertificate|collegeid/i }
]

const EXT_CATEGORY = {
  pdf: 'Document',
  doc: 'Document',
  docx: 'Document',
  png: 'Image',
  jpg: 'Image',
  jpeg: 'Image',
  webp: 'Image',
  xlsx: 'Spreadsheet',
  csv: 'Spreadsheet'
}

function humanFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let val = bytes / 1024
  let i = 0
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024
    i++
  }
  return `${val.toFixed(1)} ${units[i]}`
}

function normalizeFilename(filename) {
  return filename
    .toLowerCase()
    .replace(/[_\-\s]+/g, '')
}

function guessCategory(filename, ext) {
  const normalized = normalizeFilename(filename)
  for (const rule of CATEGORY_RULES) {
    if (rule.test.test(normalized)) {
      return rule.category
    }
  }
  return 'Other' // As requested, if no match, it defaults to 'Other'
}

function guessTags(filename) {
  const normalized = normalizeFilename(filename)
  const tags = DOC_TYPE_RULES.filter((r) => r.test.test(normalized)).map((r) => r.tag)
  return tags.length ? tags : ['Uncategorised']
}

// Runs entirely client-side over the file's non-secret attributes to build
// the searchable index record that accompanies the ciphertext.
export function extractMetadata(file) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return {
    fileName: file.name,
    extension: ext,
    category: guessCategory(file.name, ext),
    mimeType: file.type || 'application/octet-stream',
    sizeLabel: humanFileSize(file.size),
    tags: guessTags(file.name),
    indexedAt: new Date().toISOString()
  }
}
