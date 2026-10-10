import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useVault } from '../context/VaultContext.jsx'

export default function Login() {
  const { setPassphrase, setHolderName, resetVault } = useVault()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'

  // Detect if a vault key has already been configured in this browser
  const [isConfigured, setIsConfigured] = useState(() => {
    return !!localStorage.getItem('s_setu_pass_hash')
  })

  // Common states
  const [name, setName] = useState(() => {
    return localStorage.getItem('s_setu_holder') || ''
  })
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')

  // Check password strength during Configure Vault Key mode
  useEffect(() => {
    if (!pass) {
      setPasswordStrength('')
      return
    }
    if (pass.length < 8) {
      setPasswordStrength('Weak (minimum 8 characters required)')
    } else if (pass.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
      setPasswordStrength('Strong (Uppercase, Number, Special Character present)')
    } else {
      setPasswordStrength('Medium (Try adding numbers/symbols)')
    }
  }, [pass])

  const handleConfigure = (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Please enter a display name or identifier.')
    if (pass.length < 8) return setError('Passphrase needs at least 8 characters.')
    if (pass !== confirm) return setError('Verification passphrase does not match.')

    setError('')
    setLoading(true)

    // Simulate key derivation
    setTimeout(() => {
      resetVault()
      localStorage.setItem('s_setu_pass_hash', pass) // simple mock hash
      localStorage.setItem('s_setu_holder', name.trim())
      setHolderName(name.trim())
      setPassphrase(pass)
      setLoading(false)
      setSuccess(true)

      setTimeout(() => {
        navigate(redirectPath)
      }, 1000)
    }, 1500)
  }

  const handleUnlock = (e) => {
    e.preventDefault()
    const storedPass = localStorage.getItem('s_setu_pass_hash')
    const storedName = localStorage.getItem('s_setu_holder')
    
    if (storedName && name.trim() && name.trim().toLowerCase() !== storedName.toLowerCase()) {
      return setError('Invalid Display Name / Identifier for this vault session.')
    }

    if (!pass) return setError('Please enter your passphrase.')
    
    // Prototype validation
    if (pass !== storedPass) {
      return setError('Invalid passphrase for this prototype session.')
    }

    setError('')
    setLoading(true)

    // Simulate unlocking authorization delay
    setTimeout(() => {
      setPassphrase(pass)
      const finalName = storedName || name.trim() || 'User'
      setHolderName(finalName)
      setLoading(false)
      navigate(redirectPath)
    }, 1200)
  }

  const handleReset = () => {
    resetVault()
    setName('')
    setPass('')
    setConfirm('')
    setError('')
    setIsConfigured(false)
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-[#1F7A5C]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-[#E8873A]/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg glass-panel p-8 sm:p-10 rounded-2xl shadow-2xl relative">
        
        {/* Banner Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded bg-[#E8873A]/10 text-[#E8873A] border border-[#E8873A]/20 text-[10px] font-mono font-bold uppercase tracking-wide">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Frontend Prototype
        </div>

        {!isConfigured ? (
          /* PAGE 2 — CONFIGURE VAULT KEY */
          <div>
            <div className="mb-8">
              <p className="eyebrow text-[#E8873A] mb-2">SECURE AUTHENTICATION</p>
              <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
                Configure Vault Key
              </h1>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                Your passphrase is used locally in this prototype to derive encryption keys. 
                <span className="text-white font-medium"> The passphrase is intended to remain local.</span>
              </p>
            </div>

            <form onSubmit={handleConfigure} className="space-y-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-2" htmlFor="name">
                  Display Name / Identifier
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shwetha R"
                  disabled={loading || success}
                  className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white placeholder-gray-500 focus:border-[#E8873A]/80 focus:bg-white/10 transition-all outline-none text-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-2" htmlFor="pass">
                    Key Passphrase
                  </label>
                  <input
                    id="pass"
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="Min 8 chars"
                    disabled={loading || success}
                    className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white placeholder-gray-500 focus:border-[#E8873A]/80 focus:bg-white/10 transition-all outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-2" htmlFor="confirm">
                    Verify Passphrase
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm"
                    disabled={loading || success}
                    className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white placeholder-gray-500 focus:border-[#E8873A]/80 focus:bg-white/10 transition-all outline-none font-mono text-sm"
                  />
                </div>
              </div>

              {passwordStrength && (
                <p className={`text-xs font-medium ${passwordStrength.startsWith('Strong') ? 'text-[#1F7A5C]' : passwordStrength.startsWith('Medium') ? 'text-[#E8873A]' : 'text-red-400'}`}>
                  Strength: {passwordStrength}
                </p>
              )}

              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="px-4 py-3 rounded-lg bg-[#1F7A5C]/20 border border-[#1F7A5C]/30 text-[#1F7A5C] text-xs font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 shrink-0 animate-bounce">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  Vault Initialized Successfully! Redirecting to Locker...
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success}
                className="w-full glowing-btn-primary py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4 text-[#0B0F19]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Initialize Private Vault
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsConfigured(true)}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Already have a configured key? Unlock vault
              </button>
            </div>
          </div>
        ) : (
          /* PAGE 3 — UNLOCK VAULT */
          <div>
            <div className="mb-8">
              <p className="eyebrow text-[#E8873A] mb-2">LOCKER LOCKED</p>
              <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
                Authorize Vault Session First
              </h1>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                Your vault key is loaded locally in this browser prototype before document processing.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-2" htmlFor="unlock-name">
                  Username / Identifier
                </label>
                <input
                  id="unlock-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shwetha R"
                  disabled={loading}
                  className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white placeholder-gray-500 focus:border-[#E8873A]/80 focus:bg-white/10 transition-all outline-none text-sm mb-4"
                />

                <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-2" htmlFor="unlock-pass">
                  Enter Key Passphrase
                </label>
                <input
                  id="unlock-pass"
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Passphrase"
                  disabled={loading}
                  className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white placeholder-gray-500 focus:border-[#E8873A]/80 focus:bg-white/10 transition-all outline-none font-mono text-sm"
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full glowing-btn-primary py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-[#0B0F19]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authorizing...
                  </>
                ) : (
                  'Unlock Vault'
                )}
              </button>
            </form>

            <div className="mt-6 flex justify-between items-center text-xs">
              <button 
                onClick={handleReset}
                className="text-red-400/70 hover:text-red-400 transition-colors"
              >
                Start Fresh / Reset Vault
              </button>
              <button 
                onClick={() => setIsConfigured(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                Setup another key
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
