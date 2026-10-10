import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useVault } from '../context/VaultContext.jsx'

export default function Navbar() {
  const { passphrase, setPassphrase, setHolderName } = useVault()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => {
    setPassphrase('')
    navigate('/')
  }

  const isUnlocked = !!passphrase
  const isDashboard = pathname === '/dashboard'

  return (
    <header className="border-b border-white/5 bg-[#0B0F19]/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E8873A] to-[#1F7A5C] flex items-center justify-center shadow-lg shadow-[#E8873A]/10 group-hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0B0F19" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold tracking-tight text-white text-base">DocShield</span>
            <span className="text-[9px] font-mono tracking-wider text-[#1F7A5C] uppercase font-bold">Zero Knowledge</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {!isUnlocked && (
            <Link
              to="/login"
              className="text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-200 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#1F7A5C] animate-pulse" />
              Unlock Vault Session
            </Link>
          )}
          {isUnlocked && isDashboard && (
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-4 py-2 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  )
}


