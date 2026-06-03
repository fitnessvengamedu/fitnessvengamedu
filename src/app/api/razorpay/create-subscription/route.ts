import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Initialize Razorpay
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    // Create Subscription
    const subscription = await instance.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120, // Example: 10 years for a monthly plan
      notes: {
        userId: user.id // Pass user ID to identify in webhook
      }
    })

    // Create initial pending record in Supabase
    const { error: dbError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        razorpay_subscription_id: subscription.id,
        plan_id: planId,
        status: 'unpaid'
      }, { onConflict: 'user_id' }) // Assuming 1 active subscription per user. If not, use standard insert. Wait, we'll just insert/update based on user_id.

    if (dbError) {
      console.error('Database Error:', dbError)
      // Continue anyway, we can rely on webhook to create/update if needed, but good to track.
    }

    return NextResponse.json({ subscriptionId: subscription.id })

  } catch (error: unknown) {
    console.error('Razorpay Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
  }
}
