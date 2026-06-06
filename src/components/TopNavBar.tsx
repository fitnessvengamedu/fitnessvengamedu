'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TopNavBar({ appName, user: initialUser }: { appName: string, user?: any }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(initialUser || null)

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser)
      try {
        localStorage.setItem('s_fitness_user_session', JSON.stringify(initialUser))
      } catch (e) {}
      return
    }

    // Try reading cache on mount for instant visual response
    try {
      const cached = localStorage.getItem('s_fitness_user_session')
      if (cached) {
        setUser(JSON.parse(cached))
      }
    } catch (e) {}

    // Verify session client-side dynamically
    async function getSession() {
      try {
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .single()
            
          const updatedUser = {
            ...authUser,
            role: profile?.role || 'member'
          }
          setUser(updatedUser)
          localStorage.setItem('s_fitness_user_session', JSON.stringify(updatedUser))
        } else {
          setUser(null)
          localStorage.removeItem('s_fitness_user_session')
        }
      } catch (err) {
        console.error('Error verifying user session:', err)
      }
    }

    getSession()
  }, [initialUser])

  const navLinks = [
    { name: 'Training', href: '/' },
    { name: 'Facility', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Feedback', href: '/feedback' },
    { name: 'Review', href: '/review' },
  ]

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-xl border-b border-glass-stroke shadow-[0_0_20px_rgba(223,255,17,0.03)] z-50">
      <div className="flex justify-between items-center px-4 md:px-12 h-20 w-full max-w-7xl mx-auto">
        <Link href="/" className="font-extrabold text-lg md:text-2xl tracking-tighter text-white font-sora">
          <span className="text-electric-lime text-glow uppercase animate-brand-pulse inline-block">
            {appName}
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.name}
                href={link.href} 
                className={`transition-all duration-300 ${
                  isActive 
                    ? 'text-electric-lime border-b border-electric-lime pb-1' 
                    : 'text-white/60 hover:text-electric-lime'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {user && user.role === 'admin' && (
            <>
              <Link 
                href="/admin" 
                className="border border-electric-lime/30 hover:border-electric-lime hover:bg-electric-lime/10 text-electric-lime font-mono text-[10px] sm:text-xs px-3 sm:px-5 py-2 sm:py-2.5 tracking-wider sm:tracking-widest rounded-lg transition-all"
              >
                Admin Panel
              </Link>
              <form action="/auth/signout" method="post" className="inline">
                <button 
                  type="submit"
                  className="border border-apex-crimson/50 hover:bg-apex-crimson/10 text-apex-crimson font-mono text-[10px] sm:text-xs px-3 sm:px-5 py-2 sm:py-2.5 tracking-wider sm:tracking-widest rounded-lg transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </form>
            </>
          )}
          {user ? (
            user.role !== 'admin' && (
              <Link 
                href="/dashboard" 
                className="primary-btn text-[10px] sm:text-xs px-4 sm:px-6 py-2 sm:py-2.5 tracking-wider sm:tracking-widest"
              >
                <span className="inline sm:hidden">Dashboard</span>
                <span className="hidden sm:inline">Dashboard Access</span>
              </Link>
            )
          ) : (
            <>
              <Link href="/signin" className="hidden lg:block text-white/60 hover:text-electric-lime transition-colors font-mono text-xs uppercase tracking-widest">
                Member Login
              </Link>
              <Link 
                href="/signup" 
                className="primary-btn text-[10px] sm:text-xs px-4 sm:px-6 py-2 sm:py-2.5 tracking-wider sm:tracking-widest"
              >
                <span className="inline sm:hidden">Join</span>
                <span className="hidden sm:inline">Join As A Member</span>
              </Link>
            </>
          )}

          {/* Premium Animated Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center border border-glass-stroke rounded-lg text-white hover:text-electric-lime hover:border-electric-lime/30 transition-all duration-300 active:scale-95 z-50 cursor-pointer"
            aria-label="Toggle Menu"
          >
            <span className={`w-5 h-0.5 bg-current transition-all duration-300 absolute ${isOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
            <span className={`w-5 h-0.5 bg-current transition-all duration-300 absolute ${isOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-current transition-all duration-300 absolute ${isOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Container */}
      <div 
        className={`md:hidden absolute top-20 left-0 w-full bg-background/95 backdrop-blur-2xl border-b border-glass-stroke shadow-[0_15px_30px_rgba(0,0,0,0.6)] transition-all duration-300 ease-in-out origin-top ${
          isOpen 
            ? 'opacity-100 scale-y-100 pointer-events-auto' 
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        <div className="flex flex-col px-6 py-8 gap-5 font-mono text-xs uppercase tracking-widest">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.name}
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`transition-all duration-300 py-3 border-b border-white/5 ${
                  isActive 
                    ? 'text-electric-lime pl-2 border-electric-lime/20' 
                    : 'text-white/60 hover:text-electric-lime hover:pl-2'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          
          <div className="pt-4 flex flex-col gap-3">
            {user && user.role === 'admin' && (
              <>
                <Link 
                  href="/admin" 
                  onClick={() => setIsOpen(false)}
                  className="border border-electric-lime/30 hover:border-electric-lime hover:bg-electric-lime/10 text-electric-lime font-mono text-center py-3 text-xs tracking-widest rounded-lg transition-all"
                >
                  Admin Panel
                </Link>
                <form action="/auth/signout" method="post" className="w-full">
                  <button 
                    type="submit" 
                    onClick={() => setIsOpen(false)}
                    className="w-full border border-apex-crimson/50 hover:bg-apex-crimson/10 text-apex-crimson font-mono text-center py-3 text-xs tracking-widest rounded-lg transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            )}
            {user ? (
              user.role !== 'admin' && (
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className="primary-btn text-center py-3 text-xs tracking-widest"
                >
                  Dashboard Access
                </Link>
              )
            ) : (
              <>
                <Link 
                  href="/signin" 
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-electric-lime text-center py-3 transition-colors font-mono text-xs uppercase tracking-widest border border-glass-stroke rounded-lg"
                >
                  Member Login
                </Link>
                <Link 
                  href="/signup" 
                  onClick={() => setIsOpen(false)}
                  className="primary-btn text-center py-3 text-xs tracking-widest"
                >
                  Join As A Member
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
