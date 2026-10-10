import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { encryptFile, decryptFile } from '../utils/crypto'
import { extractMetadata } from '../utils/metadata'

const VaultContext = createContext(null)

export function VaultProvider({ children }) {
  const [holderName, setHolderName] = useState(() => {
    return localStorage.getItem('s_setu_holder') || ''
  })
  // Helper to fix existing document category if miscategorized
  const fixDocumentCategories = (docs) => {
    return docs.map((doc) => {
      if (doc.metadata) {
        const name = doc.metadata.fileName || ''
        if (/community|caste|category/i.test(name) && doc.metadata.category !== 'Community') {
          return {
            ...doc,
            metadata: {
              ...doc.metadata,
              category: 'Community',
              keywords: `${name.split('.')[0]}, Community, ${doc.metadata.tags ? doc.metadata.tags.join(', ') : ''}`
            }
          }
        }
      }
      return doc
    })
  }

  const [documents, setDocuments] = useState(() => {
    const storedHolder = localStorage.getItem('s_setu_holder') || ''
    if (storedHolder) {
      const saved = localStorage.getItem(`s_setu_docs_${storedHolder}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        return fixDocumentCategories(parsed)
      }
    }
    return []
  })
  const [folders, setFolders] = useState(() => {
    const storedHolder = localStorage.getItem('s_setu_holder') || ''
    if (storedHolder) {
      const saved = localStorage.getItem(`s_setu_folders_${storedHolder}`)
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return []
  })
  const [activeFolderId, setActiveFolderId] = useState(null)
  const [passphrase, setPassphrase] = useState('')

  // Load documents and folders when holderName changes
  useEffect(() => {
    if (holderName) {
      const savedDocs = localStorage.getItem(`s_setu_docs_${holderName}`)
      if (savedDocs) {
        const parsed = JSON.parse(savedDocs)
        setDocuments(fixDocumentCategories(parsed))
      }
      const savedFolders = localStorage.getItem(`s_setu_folders_${holderName}`)
      if (savedFolders) {
        setFolders(JSON.parse(savedFolders))
      }
    }
  }, [holderName])

  // Keep localStorage updated for the specific user
  useEffect(() => {
    if (holderName) {
      localStorage.setItem(`s_setu_docs_${holderName}`, JSON.stringify(documents))
      localStorage.setItem(`s_setu_folders_${holderName}`, JSON.stringify(folders))
    }
  }, [documents, folders, holderName])

  const createFolder = (name) => {
    const id = Math.random().toString(36).substring(2, 10)
    setFolders(prev => [...prev, { id, name, createdAt: new Date().toISOString() }])
    return id
  }

  const seal = async (file, folderId) => {
    const metadata = extractMetadata(file)
    // Append default keywords
    metadata.keywords = `${metadata.fileName.split('.')[0]}, ${metadata.category}, ${metadata.tags.join(', ')}`
    
    // Perform real browser-side encryption concept
    const sealedPayload = await encryptFile(file, passphrase)
    const doc = {
      id: sealedPayload.contentHash.slice(0, 16),
      folderId,
      metadata,
      sealedPayload
    }
    setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)])
    return doc
  }

  const open = async (docId) => {
    const doc = documents.find((d) => d.id === docId)
    if (!doc) throw new Error('Document not found in this session.')
    
    if (doc.isMock) {
      // Simulate decryption for mock documents during college review
      await new Promise((r) => setTimeout(r, 850))
      const mockText = `DocShield Zero Knowledge Vault Prototype\n--------------------------------------------\nDocument Name: ${doc.metadata.fileName}\nSHA-256 Fingerprint: ${doc.sealedPayload.contentHash}\nCategory: ${doc.metadata.category}\nStatus: SEALED (Decryption Concept Verified Client-Side)`
      return new Blob([mockText], { type: 'text/plain' })
    }

    const plainBuf = await decryptFile(doc.sealedPayload, passphrase)
    return new Blob([plainBuf], { type: doc.metadata.mimeType })
  }

  const remove = (docId) => setDocuments((prev) => prev.filter((d) => d.id !== docId))

  const deleteFolder = (folderId) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId))
    setDocuments((prev) => prev.filter((d) => d.folderId !== folderId))
  }

  const clearDocuments = () => {
    setDocuments([])
  }

  const resetVault = () => {
    if (holderName) {
      localStorage.removeItem(`s_setu_docs_${holderName}`)
      localStorage.removeItem(`s_setu_folders_${holderName}`)
    }
    setDocuments([])
    setFolders([])
    setActiveFolderId(null)
    setPassphrase('')
    setHolderName('')
    localStorage.removeItem('s_setu_pass_hash')
    localStorage.removeItem('s_setu_holder')
  }

  const value = useMemo(
    () => ({ documents, folders, activeFolderId, setActiveFolderId, createFolder, deleteFolder, seal, open, remove, passphrase, setPassphrase, holderName, setHolderName, resetVault, clearDocuments }),
    [documents, folders, activeFolderId, passphrase, holderName]
  )

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
}

export function useVault() {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault must be used within a VaultProvider')
  return ctx
}


