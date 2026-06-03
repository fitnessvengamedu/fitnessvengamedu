'use client'

import { useEffect, useState } from 'react'

export default function RazorpayQRCode() {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQrCode() {
      const qrId = process.env.NEXT_PUBLIC_RAZORPAY_QR_ID
      if (!qrId) {
        setError('QR Code ID not configured')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/razorpay/qr?id=${qrId}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load QR code')
        }

        setQrUrl(data.imageUrl)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchQrCode()
  }, [])

  if (loading) {
    return (
      <div className="w-48 h-48 mx-auto bg-white/5 rounded-2xl flex items-center justify-center border border-glass-stroke">
        <div className="w-8 h-8 border-2 border-electric-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !qrUrl) {
    return (
      <div className="w-48 h-48 mx-auto bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-apex-crimson/30 p-4 text-center">
        <span className="text-apex-crimson/80 text-xs font-mono uppercase tracking-widest mb-2">Error</span>
        <span className="text-white/40 text-[10px]">{error || 'QR Not Available'}</span>
      </div>
    )
  }

  return (
    <div className="relative group w-48 mx-auto">
      <div className="absolute -inset-1 bg-gradient-to-r from-electric-lime/30 to-transparent rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-white p-4 rounded-2xl ring-1 ring-white/10 shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="Razorpay Payment QR Code" className="w-full h-auto" />
      </div>
    </div>
  )
}
