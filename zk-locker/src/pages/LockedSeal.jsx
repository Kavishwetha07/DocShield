import { Link } from 'react-router-dom'

export default function LockedSeal() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-[#1F7A5C]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-[#E8873A]/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-2xl shadow-2xl relative text-center border border-white/10">
        <div className="w-12 h-12 rounded-xl bg-[#E8873A]/10 border border-[#E8873A]/20 flex items-center justify-center mx-auto mb-6 text-[#E8873A]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h1 className="font-display text-xl font-bold text-white mb-3">
          Vault Authentication Required
        </h1>

        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          To seal a document, you first need to unlock your vault.
        </p>

        <Link
          to="/login?redirect=/upload"
          className="w-full glowing-btn-primary py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 inline-block"
        >
          Unlock Your Vault
        </Link>
      </div>
    </div>
  )
}
