'use client'

import { useState } from 'react'
import { forgotPassword } from './actions'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    // Pass the client's current origin dynamically to ensure correct redirection on all domains/ports
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    
    const result = await forgotPassword(formData, origin)

    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-lime/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-glass-panel border border-glass-stroke p-8 rounded-2xl shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white font-sora tracking-tight">RECOVER <span className="text-electric-lime">PROFILE</span></h1>
          <p className="text-white/50 text-sm mt-2 font-inter">Enter your email to receive a password reset link.</p>
        </div>

        {error && (
          <div className="bg-apex-crimson/10 border border-apex-crimson/30 text-apex-crimson p-3 rounded-lg text-sm mb-6 font-mono text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-electric-lime/10 border border-electric-lime/30 text-electric-lime p-3 rounded-lg text-sm mb-6 font-mono text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-white/77 font-mono uppercase tracking-wider ml-1">Email Address</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors"
              placeholder="john@example.com"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-electric-lime text-deep-obsidian font-extrabold tracking-widest uppercase rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(223,255,17,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {loading ? 'SENDING LINK...' : 'SEND RESET LINK'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-white/50 space-y-2">
          <div>
            Remembered your password? <Link href="/signin" className="text-electric-lime hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
