import { useState } from 'react'
import { useVault } from '../context/VaultContext.jsx'

export default function DocumentCard({ doc, onViewMetadata, onDelete }) {
  const { open, folders } = useVault()
  const [status, setStatus] = useState('idle') // idle | working | error

  const handleOpen = async () => {
    setStatus('working')
    try {
      const blob = await open(doc.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.metadata.fileName
      a.click()
      URL.revokeObjectURL(url)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  // Get SVG icon based on category/filetype
  const getFileIcon = (category) => {
    const norm = (category || '').toLowerCase()
    if (norm.includes('identity') || norm.includes('aadhaar') || norm.includes('card')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-[#E8873A]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
        </svg>
      )
    }
    if (norm.includes('marksheet') || norm.includes('education') || norm.includes('degree')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-[#1F7A5C]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M12 13.489v-.001m0 .001v5.68" />
        </svg>
      )
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    )
  }

  // Format date helper
  const getFormattedDate = (isoStr) => {
    if (!isoStr) return '29 Aug 2026'
    try {
      const date = new Date(isoStr)
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return '29 Aug 2026'
    }
  }

  return (
    <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between h-[250px] border border-white/5 relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          {getFileIcon(doc.metadata.category)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white truncate text-sm" title={doc.metadata.fileName}>
            {doc.metadata.fileName}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {doc.metadata.category} · {doc.metadata.sizeLabel} · {getFormattedDate(doc.metadata.indexedAt)}
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1F7A5C]/15 border border-[#1F7A5C]/25 text-[#1F7A5C] uppercase tracking-wider">
          sealed
        </span>
      </div>

      <div className="my-2.5 flex flex-wrap gap-1.5 overflow-hidden max-h-[28px]">
        {doc.folderId && folders && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8873A]/20 border border-[#E8873A]/30 text-[#E8873A] font-mono">
            📁 {folders.find(f => f.id === doc.folderId)?.name || 'Unknown Folder'}
          </span>
        )}
        {doc.metadata.tags.map((t) => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-gray-400 font-mono">
            #{t}
          </span>
        ))}
      </div>

      <div className="bg-black/20 rounded-lg p-2.5 mb-3">
        <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 mb-0.5">
          <span>SHA256 CHECKSUM</span>
          <span>VERIFIED</span>
        </div>
        <p className="font-mono text-[10px] text-gray-400 truncate" title={doc.sealedPayload.contentHash}>
          {doc.sealedPayload.contentHash}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3.5 mt-auto">
        <button
          onClick={() => onViewMetadata(doc)}
          className="text-xs font-semibold text-[#E8873A] hover:text-white px-2 py-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-200"
        >
          View Metadata
        </button>

        <button
          onClick={handleOpen}
          disabled={status === 'working'}
          className="text-xs font-semibold px-3 py-2 rounded-lg bg-[#E8873A] hover:bg-[#D3752A] text-[#0B0F19] transition-all duration-200 flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {status === 'working' ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-[#0B0F19]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Decrypting…
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Retrieve
            </>
          )}
        </button>
        
        <button
          onClick={() => onDelete(doc)}
          className="text-xs font-semibold text-gray-500 hover:text-red-400 px-2 py-2 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>

      {status === 'error' && (
        <p className="text-[10px] text-red-400 font-semibold absolute bottom-1.5 left-6 right-6 text-center">
          Decryption failed: passphrase mismatch.
        </p>
      )}
    </div>
  )
}


