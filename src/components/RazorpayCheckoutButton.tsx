'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

interface RazorpayCheckoutButtonProps {
  planId: string | undefined
  className?: string
  children: React.ReactNode
}

export default function RazorpayCheckoutButton({ planId, className, children }: RazorpayCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    if (!planId) {
      alert("Error: Missing Plan ID. Contact Support.")
      return
    }

    setIsLoading(true)

    try {
      // 1. Create a subscription on our backend
      const res = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          // User is not authenticated, redirect to signin
          router.push('/signin')
          return
        }
        throw new Error(data.error || 'Failed to create subscription')
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key from env
        subscription_id: data.subscriptionId,
        name: process.env.NEXT_PUBLIC_APP_NAME || 'S Fitness',
        description: 'Elite Gym Membership',
        theme: {
          color: '#dfff11' // electric-lime
        },
        handler: function () {
          // Handle successful payment
          router.push('/dashboard')
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false)
          }
        }
      }

      // @ts-expect-error Razorpay is loaded via script tag
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: { error: { description: string } }) {
        alert("Payment Failed: " + response.error.description)
        setIsLoading(false)
      })
      
      rzp.open()

    } catch (error: unknown) {
      console.error(error)
      alert("Checkout Error: " + (error instanceof Error ? error.message : "Unknown error"))
      setIsLoading(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button 
        onClick={handleCheckout} 
        disabled={isLoading}
        className={`${className} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
      >
        {isLoading ? 'Processing...' : children}
      </button>
    </>
  )
}
