import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 })
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    const planIds = [
      process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY,
      process.env.NEXT_PUBLIC_RAZORPAY_PLAN_QUARTERLY,
      process.env.NEXT_PUBLIC_RAZORPAY_PLAN_HALFYEARLY,
      process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY
    ].filter(Boolean) as string[]

    const prices: Record<string, string> = {}

    // Fetch all plans in parallel
    await Promise.all(planIds.map(async (planId) => {
      try {
        const res = await fetch(`https://api.razorpay.com/v1/plans/${planId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        })

        if (res.ok) {
          const data = await res.json()
          // Amount is in paise, convert to rupees
          const amountInRupees = data.item.amount / 100
          // Format as Indian Rupee
          prices[planId] = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
          }).format(amountInRupees)
        }
      } catch (err) {
        console.error(`Failed to fetch plan ${planId}`, err)
      }
    }))

    return NextResponse.json({ prices })

  } catch (error: unknown) {
    console.error('Plan Fetch Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
  }
}
