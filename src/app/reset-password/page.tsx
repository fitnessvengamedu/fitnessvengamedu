'use client'

import { useState } from 'react'
import { resetPassword } from './actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    
    // Client-side quick check
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    const result = await resetPassword(formData)

    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2500)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-lime/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-glass-panel border border-glass-stroke p-8 rounded-2xl shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white font-sora tracking-tight">NEW <span className="text-electric-lime">PASSWORD</span></h1>
          <p className="text-white/50 text-sm mt-2 font-inter">Enter and confirm your new secure password.</p>
        </div>

        {error && (
          <div className="bg-apex-crimson/10 border border-apex-crimson/30 text-apex-crimson p-3 rounded-lg text-sm mb-6 font-mono text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-electric-lime/10 border border-electric-lime/30 text-electric-lime p-3 rounded-lg text-sm mb-6 font-mono text-center">
            {success} Redirecting to dashboard...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-white/70 font-mono uppercase tracking-wider ml-1">New Password</label>
              <input 
                name="password"
                type="password" 
                required
                className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/70 font-mono uppercase tracking-wider ml-1">Confirm New Password</label>
              <input 
                name="confirmPassword"
                type="password" 
                required
                className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-electric-lime text-deep-obsidian font-extrabold tracking-widest uppercase rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(223,255,17,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </form>
        )}

        {success && (
          <div className="mt-6">
            <Link 
              href="/dashboard"
              className="w-full inline-block text-center py-4 bg-electric-lime text-deep-obsidian font-extrabold tracking-widest uppercase rounded-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(223,255,17,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              Go To Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
