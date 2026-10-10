import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useVault } from '../context/VaultContext.jsx'
import DocumentCard from '../components/DocumentCard.jsx'
import SealDocumentModal from '../components/SealDocumentModal.jsx'

export default function Dashboard() {
  const { documents, folders, passphrase, holderName, remove, deleteFolder } = useVault()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [selectedMetadataDoc, setSelectedMetadataDoc] = useState(null)
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null)
  const [deleteConfirmFolder, setDeleteConfirmFolder] = useState(null)
  const [notification, setNotification] = useState('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const handleConfirmDelete = () => {
    if (deleteConfirmDoc) {
      remove(deleteConfirmDoc.id)
      setDeleteConfirmDoc(null)
      setNotification('Document deleted successfully.')
      setTimeout(() => {
        setNotification('')
      }, 3000)
    }
  }

  const handleConfirmDeleteFolder = () => {
    if (deleteConfirmFolder) {
      deleteFolder(deleteConfirmFolder.id)
      if (selectedFolderId === deleteConfirmFolder.id) {
        setSelectedFolderId(null)
      }
      setNotification(`Folder '${deleteConfirmFolder.name}' and its documents were deleted.`)
      setDeleteConfirmFolder(null)
      setTimeout(() => {
        setNotification('')
      }, 3000)
    }
  }

  const categories = ['All', 'Identity', 'Education', 'Income', 'Community', 'Other']

  const filtered = documents.filter((d) => {
    const matchesQuery = d.metadata.fileName.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = activeCategory === 'All' || d.metadata.category === activeCategory
    const matchesFolder = !selectedFolderId || d.folderId === selectedFolderId
    return matchesQuery && matchesCategory && matchesFolder
  })

  // Calculate size statistics
  const totalSizeKB = useMemo(() => {
    return documents.reduce((acc, d) => acc + (d.sealedPayload.ciphertext?.length || 0) / 1024, 0).toFixed(1)
  }, [documents])

  if (!passphrase) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#1F7A5C] animate-pulse" />
            <p className="eyebrow text-[#1F7A5C]">{holderName}'s locker</p>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
            My Locker
          </h1>
          <p className="text-gray-400 text-sm mt-1">Your sealed documents</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-gray-500 font-mono block">TOTAL VAULT WEIGHT</span>
            <span className="text-sm font-mono font-bold text-gray-300">{totalSizeKB} KB</span>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="glowing-btn-primary px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Seal Document
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18a2.25 2.25 0 012.25 2.25v4.25A2.25 2.25 0 0118 21H6a2.25 2.25 0 01-2.25-2.25V15.75a2.25 2.25 0 012.25-2.25zm0-4.5h18A2.25 2.25 0 0021 9V4.5A2.25 2.25 0 0018.75 2.25h-13.5A2.25 2.25 0 003 4.5V9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-2">Your Vault is Empty</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            No documents have been sealed yet.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setIsUploadModalOpen(true)} className="glowing-btn-primary px-6 py-3 rounded-xl text-sm font-semibold">
              Seal Your First Document
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Folders Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <h3 className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-wider mb-4">Folders</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 flex justify-between items-center ${
                  !selectedFolderId
                    ? 'bg-[#1F7A5C] text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>All Documents</span>
                <span className="text-[10px] font-mono bg-black/20 px-2 py-0.5 rounded-full">{documents.length}</span>
              </button>
              {folders.map(f => {
                const count = documents.filter(d => d.folderId === f.id).length
                return (
                  <div key={f.id} className="flex group relative">
                    <button
                      onClick={() => setSelectedFolderId(f.id)}
                      className={`flex-1 text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 flex justify-between items-center ${
                        selectedFolderId === f.id
                          ? 'bg-[#1F7A5C] text-white font-semibold'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate pr-2">{f.name}</span>
                      <span className="text-[10px] font-mono bg-black/20 px-2 py-0.5 rounded-full mr-6">{count}</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmFolder(f) }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Folder"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Filters Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative max-w-md w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents…"
                className="w-full border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white/5 text-white placeholder-gray-500 focus:border-[#E8873A]/80 focus:bg-white/10 outline-none transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-wider mr-2">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-mono px-3.5 py-1.5 rounded-xl border transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-[#E8873A] text-[#0B0F19] border-[#E8873A] font-bold shadow-md shadow-[#E8873A]/10'
                      : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20 bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                doc={doc} 
                onViewMetadata={(d) => setSelectedMetadataDoc(d)} 
                onDelete={(d) => setDeleteConfirmDoc(d)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No encrypted documents match your criteria.</p>
            </div>
          )}
          </div>
        </div>
      )}

      {/* PAGE 7 — METADATA VIEW MODAL */}
      {selectedMetadataDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedMetadataDoc(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <span className="eyebrow text-[#E8873A]">DOCUMENT METADATA</span>
              <h2 className="text-2xl font-bold text-white mt-1 truncate">{selectedMetadataDoc.metadata.fileName}</h2>
              <p className="text-xs text-gray-500 mt-1 font-mono">Proof of existence index wrapper</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-500 font-mono block">FILE ATTRIBUTES</span>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Name:</span> <span className="text-white truncate max-w-[180px]">{selectedMetadataDoc.metadata.fileName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Type:</span> <span className="text-white uppercase">{selectedMetadataDoc.metadata.extension}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Size:</span> <span className="text-white">{selectedMetadataDoc.metadata.sizeLabel}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Created Date:</span> <span className="text-white">{(selectedMetadataDoc.metadata.indexedAt || '').split('T')[0]}</span></div>
                </div>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-500 font-mono block">CRYPTOGRAPHIC INDEX</span>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Category:</span> <span className="text-[#1F7A5C] font-semibold">{selectedMetadataDoc.metadata.category}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Status:</span> <span className="text-emerald-400 font-bold uppercase tracking-wider">SEALED</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Method:</span> <span className="text-gray-300">Client-Side GCM</span></div>
                </div>
              </div>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-4 mb-6">
              <div>
                <span className="text-[10px] text-gray-500 font-mono block">SHA-256 FINGERPRINT (Tamper Proof Proof)</span>
                <p className="font-mono text-xs text-gray-300 mt-1 select-all break-all bg-black/40 p-2 rounded">
                  {selectedMetadataDoc.sealedPayload.contentHash}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 font-mono block">INDEXED ATTRIBUTES / SEARCH KEYS</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedMetadataDoc.metadata.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-gray-300 font-mono">
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-gray-300 font-mono">
                    {selectedMetadataDoc.metadata.category}
                  </span>
                </div>
              </div>

              {selectedMetadataDoc.metadata.keywords && (
                <div>
                  <span className="text-[10px] text-gray-500 font-mono block">KEYWORDS</span>
                  <p className="text-xs text-gray-300 mt-1 font-mono">
                    {selectedMetadataDoc.metadata.keywords}
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#E8873A]/10 border border-[#E8873A]/20 rounded-xl text-xs text-gray-400 leading-relaxed mb-6">
              <strong>Security Protocol Warning:</strong> This metadata details panel is non-revealing. 
              The raw payload remains securely encrypted in local memory. No plaintext bytes or sensitive decryption components are exposed here.
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedMetadataDoc(null)}
                className="glowing-btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold"
              >
                Close Metadata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl relative text-center">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-[#E8873A] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            
            <h3 className="font-display text-lg font-bold text-white mb-2">Delete Document?</h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Are you sure you want to delete this document?
            </p>
            <p className="font-mono text-xs text-[#E8873A] bg-black/30 p-2.5 rounded-lg border border-white/5 truncate max-w-full mb-6">
              {deleteConfirmDoc.metadata.fileName}
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setDeleteConfirmDoc(null)}
                className="glowing-btn-secondary px-5 py-3 rounded-xl text-sm font-semibold text-white flex-1 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl text-sm font-semibold flex-1 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Folders */}
      {deleteConfirmFolder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl relative text-center">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-[#E8873A] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            
            <h3 className="font-display text-lg font-bold text-white mb-2">Delete Folder?</h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              This will delete the folder and its documents.
            </p>
            <p className="font-mono text-xs text-[#E8873A] bg-black/30 p-2.5 rounded-lg border border-white/5 truncate max-w-full mb-6">
              {deleteConfirmFolder.name}
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setDeleteConfirmFolder(null)}
                className="glowing-btn-secondary px-5 py-3 rounded-xl text-sm font-semibold text-white flex-1 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteFolder}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl text-sm font-semibold flex-1 transition-colors"
              >
                Delete Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F7A5C] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-emerald-500/20 font-sans text-sm animate-fade-in-up">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
          </svg>
          {notification}
        </div>
      )}

      <SealDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onViewFolder={(id) => setSelectedFolderId(id)}
      />
    </div>
  )
}


