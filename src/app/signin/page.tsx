'use client'

import { useState } from 'react'
import { signin } from './actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await signin(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      if (result.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-lime/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-glass-panel border border-glass-stroke p-8 rounded-2xl shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white font-sora tracking-tight">MEMBER <span className="text-electric-lime">ACCESS</span></h1>
          <p className="text-white/50 text-sm mt-2 font-inter">Enter your credentials to access your profile.</p>
        </div>

        {error && (
          <div className="bg-apex-crimson/10 border border-apex-crimson/30 text-apex-crimson p-3 rounded-lg text-sm mb-6 font-mono text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-white/70 font-mono uppercase tracking-wider ml-1">Email</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs text-white/70 font-mono uppercase tracking-wider">Password</label>
              <Link href="/forgot-password" className="text-xs text-electric-lime hover:underline font-mono uppercase tracking-wider">
                Forgot Password?
              </Link>
            </div>
            <input 
              name="password"
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
            {loading ? 'AUTHENTICATING...' : 'LOGIN TO TERMINAL'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-white/50">
          Don't have a profile yet? <Link href="/signup" className="text-electric-lime hover:underline">Join Elite</Link>
        </div>
      </div>
    </div>
  )
}
