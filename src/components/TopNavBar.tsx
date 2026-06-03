'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TopNavBar({ appName, user }: { appName: string, user?: any }) {
  const pathname = usePathname()

  const navLinks = [
    { name: 'Training', href: '/' },
    { name: 'Facility', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Feedback', href: '/feedback' },
    { name: 'Review', href: '#review' }, // Can be changed when review page is created
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

        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="primary-btn">
              Dashboard Access
            </Link>
          ) : (
            <>
              <Link href="/signin" className="hidden lg:block text-white/60 hover:text-electric-lime transition-colors font-mono text-xs uppercase tracking-widest">
                Member Login
              </Link>
              <Link href="/signup" className="primary-btn">
                Join As A Member
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
