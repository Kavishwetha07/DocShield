import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useVault } from '../context/VaultContext.jsx'

const LEDGER_SAMPLE = [
  '9f3a1c…e02b',
  '4b7d20…91aa',
  'c15e88…3f0d',
  '02af6b…7c19',
  'e94d31…b8c2',
  '77102f…d4e5'
]

const PILLARS = [
  {
    n: '01',
    title: 'Encrypt Locally First',
    body: 'AES-256-GCM Authenticated Encryption occurs directly inside your browser. Your master passphrase is never stored or transmitted.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-[#E8873A]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    )
  },
  {
    n: '02',
    title: 'Zero-Knowledge Metadata Indexing',
    body: 'Only the file attributes (name, type, and size) are used to index documents. The contents remain absolutely opaque to our servers.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-[#1F7A5C]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.23 13.44l-2.25-2.25m0-3l3 3m-3-3l-3 3m12 3.562c.036.08.056.168.056.262v1.875a1.875 1.875 0 01-1.875 1.875h-15a1.875 1.875 0 01-1.875-1.875V3.07c0-.262.056-.509.156-.733M12 3v3.375c0 .621.504 1.125 1.125 1.125h3.375" />
      </svg>
    )
  },
  {
    n: '03',
    title: 'Public Cryptographic Fingerprint',
    body: 'Every document produces a unique SHA-256 fingerprint, enabling public, tamper-evident proof of existence without exposing details.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-[#E8873A]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    )
  }
]

export default function Landing() {
  const { passphrase } = useVault()
  const navigate = useNavigate()

  const handleSealClick = () => {
    if (passphrase) {
      navigate('/upload')
    } else {
      navigate('/locked-seal')
    }
  }

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#1F7A5C]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#E8873A]/10 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 cyber-grid border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 mx-auto">
              <span className="w-2 h-2 rounded-full bg-[#E8873A] animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#E8873A] font-bold">Digital India · Public Document Vault</span>
            </div>
            
            <h1 className="font-display text-5xl sm:text-7xl leading-[1.05] font-extrabold tracking-tight text-white mx-auto">
              We cannot read your documents.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8873A] via-[#E8873A] to-[#1F7A5C]">
                That is the entire point.
              </span>
            </h1>
            
            <p className="mt-6 text-lg text-gray-400 max-w-2xl leading-relaxed mx-auto">
              DocShield provides a zero-knowledge architectural locker for sensitive public files. 
              Documents are sealed on-device, indexable only by non-identifying metadata attributes. 
              Retrieve exactly what you need without revealing a single byte to the server.
            </p>
            
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/login"
                className="glowing-btn-primary px-8 py-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 transform active:scale-95"
              >
                Unlock Vault Session
              </Link>
              <button
                onClick={handleSealClick}
                className="glowing-btn-secondary text-white px-8 py-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 transform active:scale-95 flex items-center gap-2"
              >
                Seal a Document 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Pillars */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="eyebrow text-[#E8873A] mb-3">Architectural Pillars</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
            How the Seal Holds Securely
          </h2>
          <p className="text-gray-400 mt-4">
            A three-tier cryptographic barrier deployed strictly client-side to ensure that your files remain private and trustless.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PILLARS.map((p) => (
            <div key={p.n} className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  {p.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">{p.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{p.body}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="font-mono text-xs text-gray-500">Security Node</span>
                <span className="font-mono text-sm text-[#E8873A] font-bold">{p.n}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="border-y border-white/5 bg-[#16234C]/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-16 grid sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <p className="font-display text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#E8873A] to-[#D3752A]">AES-256-GCM</p>
            <p className="text-xs text-gray-400 font-mono tracking-wider uppercase">Authenticated Encryption</p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">Unique symmetric keys derived per document using client-side PBKDF2</p>
          </div>
          <div className="space-y-2 border-y sm:border-y-0 sm:border-x border-white/5 py-8 sm:py-0">
            <p className="font-display text-4xl font-extrabold text-white">Zero Leakage</p>
            <p className="text-xs text-gray-400 font-mono tracking-wider uppercase">CLIENT-SIDE PRIVACY</p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">Designed to minimize plaintext exposure</p>
          </div>
          <div className="space-y-2">
            <p className="font-display text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1F7A5C] to-emerald-400">Client-Side</p>
            <p className="text-xs text-gray-400 font-mono tracking-wider uppercase">CLIENT-SIDE INDEXING</p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">Non-sensitive tag wrappers enable fully private and customizable index querying</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 border-t border-white/5 mt-12">
        <span>Architected for the Digital India Public Locker Protocol.</span>
        <div className="flex items-center gap-4 font-mono">
          <span>v0.2 · secure build</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A5C] animate-pulse" />
        </div>
      </footer>
    </div>
  )
}

