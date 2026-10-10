import { useCallback, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useVault } from '../context/VaultContext.jsx'

const STAGES = [
  'DOCUMENT SELECTED',
  'ENCRYPTING LOCALLY',
  'GENERATING FINGERPRINT',
  'EXTRACTING METADATA',
  'CREATING INDEX',
  'DOCUMENT SEALED'
]

export default function Upload() {
  const { seal, passphrase, folders, activeFolderId, setActiveFolderId, createFolder } = useVault()
  const navigate = useNavigate()
  const [dragOver, setDragOver] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  
  // Demo states
  const [queue, setQueue] = useState([]) // [{file, stageIndex, done, error}]
  const [sealedDoc, setSealedDoc] = useState(null)
  const [showMetadataModal, setShowMetadataModal] = useState(false)

  const processFile = useCallback(
    async (file, idx) => {
      const advance = (stageIndex) =>
        setQueue((prev) => prev.map((q, i) => (i === idx ? { ...q, stageIndex } : q)))

      try {
        advance(0) // Selected
        await new Promise((r) => setTimeout(r, 400))
        advance(1) // Encrypting
        await new Promise((r) => setTimeout(r, 500))
        advance(2) // Fingerprinting
        await new Promise((r) => setTimeout(r, 400))
        advance(3) // Metadata
        await new Promise((r) => setTimeout(r, 400))
        advance(4) // Indexing
        await new Promise((r) => setTimeout(r, 400))
        
        // Execute the cryptographic sealing
        const doc = await seal(file, activeFolderId)
        
        advance(5) // Sealed
        setQueue((prev) => prev.map((q, i) => (i === idx ? { ...q, done: true } : q)))
        
        // Save the last sealed document to show result card (PAGE 6)
        setSealedDoc(doc)
      } catch (err) {
        setQueue((prev) => prev.map((q, i) => (i === idx ? { ...q, error: err.message } : q)))
      }
    },
    [seal]
  )

  const handleFiles = (fileList) => {
    if (!passphrase || !activeFolderId) return
    const files = Array.from(fileList)
    setQueue((prev) => {
      const startIdx = prev.length
      const next = [...prev, ...files.map((file) => ({ file, stageIndex: 0, done: false, error: null }))]
      files.forEach((file, i) => processFile(file, startIdx + i))
      return next
    })
  }

  if (!passphrase) {
    return <Navigate to="/login?redirect=/upload" replace />
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {!sealedDoc ? (
        /* PAGE 5 — SEAL A DOCUMENT */
        <div>
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#E8873A] animate-pulse" />
              <p className="eyebrow text-[#E8873A]">CLIENT-SIDE ENCRYPTION CONCEPT</p>
            </div>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed max-w-xl">
              Protect your document before storage. Raw file contents are never transmitted. 
              Only the generated ciphertext block and its tags wrapper reach the local registry.
            </p>
          </div>

          <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 text-sm">Select Destination Folder</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={activeFolderId || ''}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setIsCreatingFolder(true)
                  } else {
                    setActiveFolderId(e.target.value)
                    setIsCreatingFolder(false)
                  }
                }}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#E8873A]/80 transition-all"
              >
                <option value="" disabled>-- Choose a Folder --</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
                <option value="new">+ Create New Folder</option>
              </select>
              
              {isCreatingFolder && (
                <div className="flex gap-2 flex-1">
                  <input 
                    type="text" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder Name"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#E8873A]/80 transition-all"
                  />
                  <button
                    onClick={() => {
                      if (newFolderName.trim()) {
                        const id = createFolder(newFolderName.trim())
                        setActiveFolderId(id)
                        setIsCreatingFolder(false)
                        setNewFolderName('')
                      }
                    }}
                    className="glowing-btn-primary px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap"
                  >
                    Create
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={!activeFolderId ? "opacity-50 pointer-events-none relative" : "relative"}>
            <label
              onDragOver={(e) => {
                e.preventDefault()
                if (activeFolderId) setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                if (activeFolderId) handleFiles(e.dataTransfer.files)
              }}
              className={`block border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 relative ${
                activeFolderId ? 'cursor-pointer' : 'cursor-not-allowed'
              } ${
                dragOver 
                  ? 'border-[#E8873A] bg-[#E8873A]/5 shadow-[0_0_20px_rgba(232,135,58,0.1)]' 
                  : 'border-white/10 bg-white/3 hover:bg-white/5 hover:border-white/20'
              }`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                className="hidden"
                disabled={!activeFolderId}
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <p className="font-display text-lg font-bold text-white mb-1">Drop your document here</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed mb-4">
                or
              </p>
              <span className="glowing-btn-secondary text-white px-5 py-2 rounded-xl text-sm font-semibold inline-block">
                Choose Document
              </span>
              <p className="text-[10px] text-gray-500 mt-4">
                Accepted formats: PDF, DOCX, JPG, PNG
              </p>
            </label>
            {!activeFolderId && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] rounded-2xl z-10">
                <span className="bg-[#0B0F19] text-[#E8873A] px-4 py-2 rounded-xl text-sm font-bold border border-[#E8873A]/30">
                  Select a folder first
                </span>
              </div>
            )}
          </div>

          {queue.length > 0 && (
            <div className="mt-10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="eyebrow text-gray-500">Sealing Queue</span>
                <span className="text-[10px] font-mono font-bold text-[#1F7A5C] bg-[#1F7A5C]/15 border border-[#1F7A5C]/25 px-2 py-0.5 rounded uppercase">
                  Processing Pipeline
                </span>
              </div>

              {queue.map((q, i) => (
                <div key={i} className="glass-panel rounded-xl p-5 border border-white/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white truncate max-w-sm">{q.file.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Type: {q.file.name.split('.').pop()?.toUpperCase()} · Size: {(q.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  </div>

                  {q.error ? (
                    <div className="px-3 py-2 rounded bg-red-950/20 border border-red-500/20 text-red-400 text-xs">
                      {q.error}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {STAGES.map((label, si) => (
                          <div key={label} className="flex-1">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                si <= q.stageIndex ? 'bg-[#1F7A5C]' : 'bg-white/10'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Active stage detail text */}
                      <div className="grid grid-cols-3 text-[10px] font-mono text-gray-500 mt-2">
                        <span>STAGE {String(q.stageIndex + 1).padStart(2, '0')} / 06</span>
                        <span className="text-center text-white font-bold">{STAGES[q.stageIndex]}</span>
                        <span className="text-right text-gray-400">{(q.stageIndex / 5 * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* PAGE 6 — SEALED DOCUMENT RESULT */
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#1F7A5C]/20 border border-[#1F7A5C]/30 flex items-center justify-center mx-auto mb-4 text-[#1F7A5C]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <p className="eyebrow text-[#1F7A5C] mb-1">SUCCESS STATE</p>
            <h1 className="font-display text-3xl font-extrabold text-white">DOCUMENT SEALED SUCCESSFULLY</h1>
            <p className="text-xs text-gray-500 mt-2 font-mono">Prototype Sandbox Seal complete</p>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden mb-8">
            <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
              <div>
                <span className="eyebrow text-gray-500 block">DOCUMENT SUMMARY</span>
                <h3 className="font-bold text-white text-lg mt-1">{sealedDoc.metadata.fileName}</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[#1F7A5C]/20 border border-[#1F7A5C]/30 text-emerald-400 uppercase tracking-wider">
                {sealedDoc.metadata.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6">
              <div>
                <span className="text-xs text-gray-500 block">Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SEALED
                </span>
              </div>
              
              <div>
                <span className="text-xs text-gray-500 block">File Type:</span>
                <span className="text-white font-medium uppercase mt-0.5">{sealedDoc.metadata.extension}</span>
              </div>

              <div>
                <span className="text-xs text-gray-500 block">File Size:</span>
                <span className="text-white font-medium mt-0.5">{sealedDoc.metadata.sizeLabel}</span>
              </div>

              <div>
                <span className="text-xs text-gray-500 block">Date Indexed:</span>
                <span className="text-white font-medium mt-0.5">29 Aug 2026</span>
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
              <span className="text-[10px] text-gray-500 font-mono block">SHA-256 FINGERPRINT</span>
              <p className="font-mono text-xs text-gray-300 truncate mt-1" title={sealedDoc.sealedPayload.contentHash}>
                {sealedDoc.sealedPayload.contentHash}
              </p>
            </div>
            
            <p className="text-[10px] text-gray-500 mt-4 leading-relaxed italic text-center">
              * Note: The document index wrapper is registered client-side. Ciphertext remains local in prototype memory.
            </p>
          </div>

          <div className="flex justify-between items-center gap-4">
            <button
              onClick={() => setShowMetadataModal(true)}
              className="glowing-btn-secondary px-6 py-3.5 rounded-xl text-sm font-bold text-white flex-1 hover:bg-white/10"
            >
              View Metadata
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="glowing-btn-primary px-6 py-3.5 rounded-xl text-sm font-bold flex-1"
            >
              Back to My Locker
            </button>
          </div>
        </div>
      )}

      {/* PAGE 7 — METADATA VIEW IN MODAL */}
      {showMetadataModal && sealedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowMetadataModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <span className="eyebrow text-[#E8873A]">DOCUMENT METADATA</span>
              <h2 className="text-2xl font-bold text-white mt-1 truncate">{sealedDoc.metadata.fileName}</h2>
              <p className="text-xs text-gray-500 mt-1 font-mono">Proof of existence index wrapper</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-500 font-mono block">FILE ATTRIBUTES</span>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Name:</span> <span className="text-white truncate max-w-[180px]">{sealedDoc.metadata.fileName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Type:</span> <span className="text-white uppercase">{sealedDoc.metadata.extension}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Size:</span> <span className="text-white">{sealedDoc.metadata.sizeLabel}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Created Date:</span> <span className="text-white">29 Aug 2026</span></div>
                </div>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-500 font-mono block">CRYPTOGRAPHIC INDEX</span>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Category:</span> <span className="text-[#1F7A5C] font-semibold">{sealedDoc.metadata.category}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Status:</span> <span className="text-emerald-400 font-bold uppercase tracking-wider">SEALED</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Method:</span> <span className="text-gray-300">Client-Side GCM</span></div>
                </div>
              </div>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-4 mb-6">
              <div>
                <span className="text-[10px] text-gray-500 font-mono block">SHA-256 FINGERPRINT (Tamper Proof Proof)</span>
                <p className="font-mono text-xs text-gray-300 mt-1 select-all break-all bg-black/40 p-2 rounded">
                  {sealedDoc.sealedPayload.contentHash}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 font-mono block">INDEXED ATTRIBUTES / SEARCH KEYS</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sealedDoc.metadata.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-gray-300 font-mono">
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-gray-300 font-mono">
                    {sealedDoc.metadata.category}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 font-mono block">KEYWORDS</span>
                <p className="text-xs text-gray-300 mt-1 font-mono">
                  {sealedDoc.metadata.keywords || `${sealedDoc.metadata.fileName.split('.')[0]}, ${sealedDoc.metadata.category}`}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#E8873A]/10 border border-[#E8873A]/20 rounded-xl text-xs text-gray-400 leading-relaxed mb-6">
              <strong>Security Protocol Warning:</strong> This metadata details panel is non-revealing. 
              The raw payload remains securely encrypted in local memory. No plaintext bytes or sensitive decryption components are exposed here.
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowMetadataModal(false)}
                className="glowing-btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold"
              >
                Close Metadata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


