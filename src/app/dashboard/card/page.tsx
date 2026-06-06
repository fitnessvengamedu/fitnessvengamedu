import Link from 'next/link'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { ArrowLeft } from 'lucide-react'
import StandaloneCardViewer from '@/components/StandaloneCardViewer'

export default async function StandaloneCardPage({
  searchParams,
}: {
  searchParams: Promise<{ test?: string }>
}) {
  const resolvedParams = await searchParams
  const isTest = resolvedParams?.test === 'true'
  
  let memberDetails = {
    memberId: 'SAMPLE-99',
    fullName: 'SAMPLE ATHLETE',
    age: '28',
    gender: 'Male',
    joinDateString: new Date().toISOString(),
    periodStayMonths: 3,
    subscriptionActive: false,
    isTest: true
  }

  // Get active session
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const adminSupabase = await createAdminClient()
    
    // Fetch profile
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Fetch subscription
    const { data: subscription } = await adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const metadata = user.user_metadata || {}

    // Determine period stay
    let periodStayMonths = 1
    if (subscription) {
      if (subscription.plan_id === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY) periodStayMonths = 1
      else if (subscription.plan_id === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_QUARTERLY) periodStayMonths = 3
      else if (subscription.plan_id === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_HALFYEARLY) periodStayMonths = 6
      else if (subscription.plan_id === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY) periodStayMonths = 12
    } else if (isTest) {
      periodStayMonths = 3
    }

    const joinDate = subscription?.updated_at ? new Date(subscription.updated_at) : new Date()

    memberDetails = {
      memberId: profile?.member_id || metadata.member_id || String(user.id).substring(0, 8).toUpperCase(),
      fullName: profile?.full_name || metadata.full_name || 'Classified Member',
      age: profile?.age || metadata.age || '25',
      gender: profile?.gender || metadata.gender || 'Agnostic',
      joinDateString: joinDate.toISOString(),
      periodStayMonths: periodStayMonths,
      subscriptionActive: !!subscription,
      isTest: isTest
    }
  }

  return (
    <div className="min-h-screen bg-deep-obsidian py-12 px-4 md:px-12 flex flex-col items-center justify-center relative overflow-hidden print:p-0 print:bg-white print:min-h-0">
      {/* Visual decorative backgrounds (hidden when printing) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-electric-lime/5 rounded-full blur-[120px] pointer-events-none print:hidden" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-apex-crimson/5 rounded-full blur-[100px] pointer-events-none print:hidden" />

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 print:gap-0">
        {/* Navigation / Header (hidden when printing) */}
        <div className="w-full flex justify-between items-center pb-6 border-b border-glass-stroke print:hidden">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white/60 hover:text-electric-lime font-mono text-xs uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="text-right">
            <h1 className="text-xl font-bold text-white font-sora tracking-tight">
              ELITE <span className="text-electric-lime">MEMBER CARD</span>
            </h1>
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest mt-1">
              Apex Performance Pass
            </p>
          </div>
        </div>

        {/* Dynamic Interactive Card Presenter */}
        <StandaloneCardViewer details={memberDetails} />
        
        {/* Note (hidden when printing) */}
        <p className="text-center text-xs text-white/30 font-mono uppercase tracking-widest max-w-md print:hidden">
          Present this barcode or chip ID at the reception deck scanner to register facility check-in.
        </p>
      </div>
    </div>
  )
}
