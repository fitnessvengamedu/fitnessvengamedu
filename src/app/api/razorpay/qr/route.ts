import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const qrId = searchParams.get('id')

    if (!qrId) {
      return NextResponse.json({ error: 'QR ID is required' }, { status: 400 })
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 })
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    // Fetch the QR code from Razorpay API
    const res = await fetch(`https://api.razorpay.com/v1/payments/qr_codes/${qrId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Razorpay QR Error:', errorData)
      return NextResponse.json({ error: 'Failed to fetch QR code from Razorpay' }, { status: res.status })
    }

    const data = await res.json()

    return NextResponse.json({ imageUrl: data.image_url })

  } catch (error: unknown) {
    console.error('QR Fetch Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
  }
}
