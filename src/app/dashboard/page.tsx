import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { User, Droplet, MapPin, Phone, ShieldCheck } from 'lucide-react'
import BmiCalculator from '@/components/BmiCalculator'
import DigitalCard from '@/components/DigitalCard'
import GoalTracker from '@/components/GoalTracker'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ test?: string }>
}) {
  const resolvedParams = await searchParams
  const isTest = resolvedParams?.test === 'true'
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/signin')
  }

  // Fetch full profile data from our custom profiles table (if it exists)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const metadata = user.user_metadata || {}

  const fullName = profile?.full_name || metadata.full_name || (isTest ? 'TESTING MEMBER' : 'Classified')
  const bloodGroup = profile?.blood_group || metadata.blood_group || (isTest ? 'O+' : 'Unknown')
  const phone = profile?.phone || metadata.phone || (isTest ? '+91 98765 43210' : 'Not Provided')
  
  const street = profile?.street || metadata.street || ''
  const area = profile?.area || metadata.area || ''
  const district = profile?.district || metadata.district || ''
  const address = [street, area, district].filter(Boolean).join(', ') || (isTest ? '123 Main St, Apex Sector, IN' : 'Location Unregistered')
  
  const age = profile?.age || metadata.age || (isTest ? '25' : '')
  const gender = profile?.gender || metadata.gender || (isTest ? 'Male' : '')
  const memberId = profile?.member_id || metadata.member_id || (isTest ? '1337' : '')

  const fitnessGoal = profile?.fitness_goal || metadata.fitness_goal || ''
  const targetWeight = profile?.target_weight || metadata.target_weight || ''
  const targetCalories = profile?.target_calories || metadata.target_calories || ''
  const targetTimeframe = profile?.target_timeframe || metadata.target_timeframe || ''
  const dailyLogs = profile?.daily_logs || metadata.daily_logs || []
  const goalsList = profile?.goals_list || metadata.goals_list || []

  const telegramChatId = profile?.telegram_chat_id || metadata.telegram_chat_id || ''
  const isTelegramLinked = !!telegramChatId

  // Determine period stay from active subscription plan
  let periodStayMonths = 1
  if (subscription) {
    if (subscription.plan_id === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY) periodStayMonths = 1
    else if (subscription.plan_id === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_QUARTERLY) periodStayMonths = 3
    else if (subscription.plan_id === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_HALFYEARLY) periodStayMonths = 6
    else if (subscription.plan_id === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY) periodStayMonths = 12
  } else if (isTest) {
    periodStayMonths = 3 // default test duration: quarterly
  }

  const joinDate = subscription?.updated_at ? new Date(subscription.updated_at) : new Date()

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

        {/* Profile & ID Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-2 bg-glass-panel border border-glass-stroke p-8 rounded-2xl relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-electric-lime/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div>
              <h2 className="text-xl font-bold text-white font-sora mb-6 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-electric-lime" />
                ELITE PROFILE DATA
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/40 font-mono text-xs uppercase tracking-widest">
                    <User className="w-4 h-4" /> Full Name
                  </div>
                  <div className="text-white font-medium">{fullName}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/40 font-mono text-xs uppercase tracking-widest">
                    <Droplet className="w-4 h-4 text-apex-crimson" /> Blood Group
                  </div>
                  <div className="text-white font-medium">{bloodGroup}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/40 font-mono text-xs uppercase tracking-widest">
                    <Phone className="w-4 h-4" /> Secure Comms
                  </div>
                  <div className="text-white font-medium">{phone}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/40 font-mono text-xs uppercase tracking-widest">
                    <MapPin className="w-4 h-4" /> Sector
                  </div>
                  <div className="text-white font-medium text-sm leading-relaxed">
                    {address}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Card Column */}
          <div className="md:col-span-1 h-full">
            {subscription || isTest ? (
              <div className="bg-glass-panel border border-glass-stroke p-4 rounded-2xl flex items-center justify-center h-full">
                <DigitalCard 
                  memberId={memberId}
                  fullName={fullName}
                  age={age}
                  gender={gender}
                  joinDate={joinDate}
                  periodStayMonths={periodStayMonths}
                />
              </div>
            ) : (
              <div className="bg-glass-panel border border-glass-stroke p-8 rounded-2xl flex flex-col h-full">
                <h3 className="text-lg font-bold text-white font-sora mb-2">SUBSCRIPTION STATUS</h3>
                <p className="text-sm text-white/60 mb-6 leading-relaxed flex-1">
                  Your elite membership requires activation. Proceed to the secure payment portal to unlock full facility access.
                </p>
                <Link href="/services" className="w-full py-3 bg-electric-lime text-deep-obsidian font-bold tracking-widest uppercase text-xs rounded hover:bg-white transition-colors shadow-[0_0_15px_rgba(223,255,17,0.2)] text-center mt-auto">
                  Initialize Payment
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Action Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BmiCalculator />

          <div className="bg-deep-obsidian/50 border border-glass-stroke p-8 rounded-2xl flex flex-col h-full">
            <h3 className="text-lg font-bold text-white font-sora mb-2">TELEGRAM PROTOCOL</h3>
            <p className="text-sm text-white/60 mb-6 leading-relaxed flex-1">
              {isTelegramLinked 
                ? "Your Telegram account is active and linked. You will receive progress reports, workout routines, and fitness metrics directly to your chat."
                : "Link your Telegram account to receive encrypted workout plans, diet instructions, and direct comms from your trainer."}
            </p>
            {isTelegramLinked ? (
              <div className="w-full py-3 bg-electric-lime/10 border border-electric-lime/30 text-electric-lime font-mono text-center text-xs uppercase tracking-widest rounded-lg mt-auto">
                Status: Connected
              </div>
            ) : (
              <Link 
                href={`https://t.me/${process.env.TELEGRAM_MEMBER_BOT_USERNAME || 'My_gym_tranning_bot'}?start=${user.id}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="w-full py-3 bg-white text-deep-obsidian font-bold tracking-widest uppercase text-xs rounded hover:bg-electric-lime transition-colors text-center mt-auto"
              >
                Link Device
              </Link>
            )}
          </div>

          <GoalTracker 
            initialGoal={fitnessGoal} 
            initialWeight={targetWeight} 
            initialCalories={targetCalories} 
            initialTimeframe={targetTimeframe}
            initialGoalsList={goalsList}
            dailyLogs={dailyLogs}
          />
        </div>

      </div>
    </div>
  )
}
