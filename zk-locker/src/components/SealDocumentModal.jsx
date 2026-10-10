import { useState, useCallback } from 'react'
import { useVault } from '../context/VaultContext.jsx'

const STAGES = [
  'DOCUMENT SELECTED',
  'ENCRYPTING LOCALLY',
  'GENERATING FINGERPRINT',
  'EXTRACTING METADATA',
  'CREATING INDEX',
  'DOCUMENT SEALED'
]

export default function SealDocumentModal({ isOpen, onClose, onViewFolder }) {
  const { folders, createFolder, seal, passphrase } = useVault()
  const [uploadStep, setUploadStep] = useState('folder') // 'folder', 'file', 'sealing', 'success'
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [sealedDoc, setSealedDoc] = useState(null)
  
  // Sealing states
  const [stageIndex, setStageIndex] = useState(-1)
  const [error, setError] = useState(null)

  const resetState = () => {
    setUploadStep('folder')
    setSelectedFolderId(null)
    setIsCreatingFolder(false)
    setNewFolderName('')
    setSelectedFile(null)
    setSealedDoc(null)
    setStageIndex(-1)
    setError(null)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const id = createFolder(newFolderName.trim())
      setSelectedFolderId(id)
      setIsCreatingFolder(false)
      setNewFolderName('')
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const processFile = async () => {
    if (!selectedFile || !selectedFolderId || !passphrase) return
    
    setUploadStep('sealing')
    setStageIndex(0)
    setError(null)

    try {
      setStageIndex(0) // Selected
      await new Promise((r) => setTimeout(r, 400))
      setStageIndex(1) // Encrypting
      await new Promise((r) => setTimeout(r, 500))
      setStageIndex(2) // Fingerprinting
      await new Promise((r) => setTimeout(r, 400))
      setStageIndex(3) // Metadata
      await new Promise((r) => setTimeout(r, 400))
      setStageIndex(4) // Indexing
      await new Promise((r) => setTimeout(r, 400))
      
      const doc = await seal(selectedFile, selectedFolderId)
      
      setStageIndex(5) // Sealed
      setSealedDoc(doc)
      setUploadStep('success')
    } catch (err) {
      setError(err.message)
    }
  }

  if (!isOpen) return null

  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1"
          title="Cancel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {uploadStep === 'folder' && (
          <div>
            <div className="mb-6 pr-6">
              <h2 className="text-xl font-bold text-white">Select Folder</h2>
              <p className="text-sm text-gray-400 mt-1">Where do you want to store this document?</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {folders.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-2 ${
                    selectedFolderId === f.id
                      ? 'bg-[#1F7A5C]/20 border-[#1F7A5C] text-white shadow-[0_0_15px_rgba(31,122,92,0.15)]'
                      : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="text-lg">📁</span>
                  <span className="truncate text-sm font-medium">{f.name}</span>
                </button>
              ))}
            </div>

            {isCreatingFolder ? (
              <div className="mb-6 flex gap-2">
                <input 
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder Name"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#E8873A]/80 transition-all"
                  autoFocus
                />
                <button onClick={handleCreateFolder} className="bg-[#1F7A5C] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors">
                  Create Folder
                </button>
                <button onClick={() => setIsCreatingFolder(false)} className="text-gray-400 hover:text-white px-2 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsCreatingFolder(true)}
                className="w-full mb-6 border border-dashed border-white/20 rounded-xl py-3 text-sm font-medium text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Create New Folder
              </button>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button onClick={handleClose} className="text-gray-400 hover:text-white text-sm font-semibold px-4 py-2">
                Cancel
              </button>
              <button 
                onClick={() => setUploadStep('file')} 
                disabled={!selectedFolderId}
                className="glowing-btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {uploadStep === 'file' && (
          <div>
            <div className="mb-6 pr-6">
              <h2 className="text-xl font-bold text-white">Select Document</h2>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                Selected Folder: <span className="text-[#E8873A] font-medium flex items-center gap-1">📁 {selectedFolder?.name}</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block border-2 border-dashed border-white/10 bg-black/20 hover:bg-white/5 rounded-2xl p-8 text-center cursor-pointer transition-all">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white font-medium mb-1">{selectedFile ? selectedFile.name : 'Choose a document to seal'}</p>
                {selectedFile ? (
                  <p className="text-xs text-[#1F7A5C] font-mono">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                ) : (
                  <p className="text-xs text-gray-500">Accepted: PDF, DOC, DOCX, JPG, JPEG, PNG</p>
                )}
              </label>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div className="flex gap-2">
                <button onClick={handleClose} className="text-gray-400 hover:text-white text-sm font-semibold px-3 py-2">
                  Cancel
                </button>
                <button onClick={() => setUploadStep('folder')} className="text-gray-400 hover:text-white text-sm font-semibold px-3 py-2">
                  Change Folder
                </button>
              </div>
              <button 
                onClick={processFile} 
                disabled={!selectedFile}
                className="glowing-btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none"
              >
                Seal Document
              </button>
            </div>
          </div>
        )}

        {uploadStep === 'sealing' && (
          <div className="py-4">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#1F7A5C] border-t-transparent animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-white mb-2">Sealing Document...</h2>
              <p className="text-sm text-gray-400">Client-side encryption in progress</p>
            </div>

            {error ? (
              <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-4 text-center">
                <p className="text-sm text-red-400">{error}</p>
                <button onClick={() => setUploadStep('file')} className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors">Go Back</button>
              </div>
            ) : (
              <div className="space-y-4 max-w-sm mx-auto">
                {STAGES.map((label, i) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${i <= stageIndex ? 'bg-[#1F7A5C] shadow-[0_0_8px_rgba(31,122,92,0.8)]' : 'bg-white/10'}`}></div>
                    <span className={`text-xs font-mono transition-colors duration-300 ${i <= stageIndex ? 'text-white' : 'text-gray-600'}`}>{label}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-center mt-8">
              <button onClick={handleClose} className="text-gray-500 hover:text-white text-xs font-semibold">Cancel Upload</button>
            </div>
          </div>
        )}

        {uploadStep === 'success' && sealedDoc && (
          <div className="py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1F7A5C]/20 border border-[#1F7A5C]/30 flex items-center justify-center mx-auto mb-6 text-[#1F7A5C]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Document Sealed Successfully</h2>
            <p className="text-sm text-gray-400 mb-8">It has been encrypted and stored in your vault.</p>

            <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-left mb-8 max-w-sm mx-auto">
              <div className="mb-2">
                <span className="text-[10px] font-mono text-gray-500 block mb-0.5">DOCUMENT</span>
                <span className="text-sm text-white font-medium truncate block" title={sealedDoc.metadata.fileName}>{sealedDoc.metadata.fileName}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-500 block mb-0.5">FOLDER</span>
                <span className="text-sm text-[#E8873A] font-medium flex items-center gap-1.5">📁 {selectedFolder?.name}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button onClick={handleClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                Close
              </button>
              <button 
                onClick={() => {
                  onViewFolder(selectedFolderId)
                  handleClose()
                }}
                className="glowing-btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold"
              >
                View Folder
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
