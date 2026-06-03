import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { User, Droplet, MapPin, Phone, ShieldCheck } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/signin')
  }

  // Fetch full profile data from our custom profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-deep-obsidian pt-12 px-4 md:px-12 pb-24">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-glass-stroke pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white font-sora tracking-tight">
              MEMBER <span className="text-electric-lime">DASHBOARD</span>
            </h1>
            <p className="text-white/50 mt-2 font-mono uppercase tracking-widest text-xs">
              System Access Granted • {user.email}
            </p>
          </div>
          
          <form action="/auth/signout" method="post">
            <button className="px-6 py-3 border border-apex-crimson/50 text-apex-crimson hover:bg-apex-crimson/10 transition-colors font-mono uppercase tracking-widest text-xs rounded-lg">
              Terminate Session
            </button>
          </form>
        </div>

        {/* Profile Card */}
        <div className="bg-glass-panel border border-glass-stroke p-8 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-electric-lime/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <h2 className="text-xl font-bold text-white font-sora mb-6 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-electric-lime" />
            ELITE PROFILE DATA
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/40 font-mono text-xs uppercase tracking-widest">
                <User className="w-4 h-4" /> Full Name
              </div>
              <div className="text-white font-medium">{profile?.full_name || 'Classified'}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/40 font-mono text-xs uppercase tracking-widest">
                <Droplet className="w-4 h-4 text-apex-crimson" /> Blood Group
              </div>
              <div className="text-white font-medium">{profile?.blood_group || 'Unknown'}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/40 font-mono text-xs uppercase tracking-widest">
                <Phone className="w-4 h-4" /> Secure Comms
              </div>
              <div className="text-white font-medium">{profile?.phone || 'Not Provided'}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/40 font-mono text-xs uppercase tracking-widest">
                <MapPin className="w-4 h-4" /> Sector
              </div>
              <div className="text-white font-medium text-sm">
                {profile?.street ? `${profile.street}, ${profile.area}, ${profile.district}` : 'Location Unregistered'}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription / Next Steps Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-deep-obsidian/50 border border-glass-stroke p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-white font-sora mb-2">TELEGRAM PROTOCOL</h3>
            <p className="text-sm text-white/60 mb-6 leading-relaxed">
              Link your Telegram account to receive encrypted workout plans, diet instructions, and direct comms from your trainer.
            </p>
            <Link href="#" className="inline-block px-6 py-3 bg-white text-deep-obsidian font-bold tracking-widest uppercase text-xs rounded hover:bg-electric-lime transition-colors">
              Link Device
            </Link>
          </div>

          <div className="bg-deep-obsidian/50 border border-glass-stroke p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-white font-sora mb-2">SUBSCRIPTION STATUS</h3>
            <p className="text-sm text-white/60 mb-6 leading-relaxed">
              Your elite membership requires activation. Proceed to the secure payment portal to unlock full facility access.
            </p>
            <Link href="/services" className="inline-block px-6 py-3 bg-electric-lime text-deep-obsidian font-bold tracking-widest uppercase text-xs rounded hover:bg-white transition-colors shadow-[0_0_15px_rgba(223,255,17,0.2)]">
              Initialize Payment
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
