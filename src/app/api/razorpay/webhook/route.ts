import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    // Handle subscription charged event
    if (event.event === 'subscription.charged') {
      const subscriptionId = event.payload.subscription.entity.id
      const paymentId = event.payload.payment.entity.id
      const status = event.payload.subscription.entity.status // usually 'active'
      const planId = event.payload.subscription.entity.plan_id
      const userId = event.payload.subscription.entity.notes?.userId

      // If we don't have userId in notes, we can look it up by subscription_id
      let query = supabaseAdmin
        .from('subscriptions')
        .update({
          status: status,
          razorpay_payment_id: paymentId,
          plan_id: planId,
          updated_at: new Date().toISOString()
        })

      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        query = query.eq('razorpay_subscription_id', subscriptionId)
      }

      const { error } = await query

      if (error) {
        console.error('Webhook DB Error:', error)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
    }

    // Handle subscription cancelled/halted
    if (event.event === 'subscription.cancelled' || event.event === 'subscription.halted') {
      const subscriptionId = event.payload.subscription.entity.id
      const status = event.payload.subscription.entity.status

      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('razorpay_subscription_id', subscriptionId)
    }

    return NextResponse.json({ status: 'ok' })

  } catch (error: unknown) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
