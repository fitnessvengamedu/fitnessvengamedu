'use client'

import { useState } from 'react'
import { signup } from './actions'
import Link from 'next/link'

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // If successful, the action will automatically redirect to /dashboard
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-lime/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-glass-panel border border-glass-stroke p-8 rounded-2xl shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white font-sora tracking-tight">JOIN <span className="text-electric-lime">ELITE</span></h1>
          <p className="text-white/50 text-sm mt-2 font-inter">Enter your details to initiate your profile.</p>
        </div>

        {error && (
          <div className="bg-apex-crimson/10 border border-apex-crimson/30 text-apex-crimson p-3 rounded-lg text-sm mb-6 font-mono text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs text-white/70 font-mono uppercase tracking-wider ml-1">Full Name *</label>
              <input 
                name="fullName"
                type="text" 
                required
                className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors"
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-white/70 font-mono uppercase tracking-wider ml-1">Phone *</label>
              <input 
                name="phone"
                type="tel" 
                required
                className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors"
                placeholder="+91..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/70 font-mono uppercase tracking-wider ml-1">Email *</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/70 font-mono uppercase tracking-wider ml-1">Password *</label>
            <input 
              name="password"
              type="password" 
              required
              minLength={6}
              className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/70 font-mono uppercase tracking-wider ml-1 text-apex-crimson font-bold">Blood Group *</label>
            <select 
              name="bloodGroup" 
              required
              defaultValue=""
              className="w-full bg-deep-obsidian/50 border border-apex-crimson/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-apex-crimson transition-colors appearance-none"
            >
              <option value="" disabled className="bg-deep-obsidian text-white/50">Select Blood Group</option>
              <option value="A+" className="bg-deep-obsidian text-white">A+</option>
              <option value="A-" className="bg-deep-obsidian text-white">A-</option>
              <option value="B+" className="bg-deep-obsidian text-white">B+</option>
              <option value="B-" className="bg-deep-obsidian text-white">B-</option>
              <option value="AB+" className="bg-deep-obsidian text-white">AB+</option>
              <option value="AB-" className="bg-deep-obsidian text-white">AB-</option>
              <option value="O+" className="bg-deep-obsidian text-white">O+</option>
              <option value="O-" className="bg-deep-obsidian text-white">O-</option>
            </select>
          </div>

          <div className="pt-2 border-t border-glass-stroke">
            <p className="text-xs text-white/40 mb-3 font-mono uppercase tracking-wider">Address Details (Optional)</p>
            <div className="space-y-4">
              <input 
                name="street"
                type="text" 
                className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors text-sm"
                placeholder="Street Address"
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  name="area"
                  type="text" 
                  className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors text-sm"
                  placeholder="Area / City"
                />
                <input 
                  name="district"
                  type="text" 
                  className="w-full bg-deep-obsidian/50 border border-glass-stroke rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-electric-lime/50 transition-colors text-sm"
                  placeholder="District / State"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-4 bg-electric-lime text-deep-obsidian font-extrabold tracking-widest uppercase rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(223,255,17,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {loading ? 'INITIALIZING...' : 'CREATE PROFILE'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/50">
          Already in the system? <Link href="/signin" className="text-electric-lime hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
