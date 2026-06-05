'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CreditCard, ShieldAlert, ExternalLink, ShieldCheck } from 'lucide-react'
import DigitalCard from './DigitalCard'

interface IDCardWrapperProps {
  memberId: string
  fullName: string
  age: string
  gender: string
  joinDateString: string
  periodStayMonths: number
  subscriptionActive: boolean
  isTest: boolean
}

export default function IDCardWrapper({
  memberId,
  fullName,
  age,
  gender,
  joinDateString,
  periodStayMonths,
  subscriptionActive,
  isTest
}: IDCardWrapperProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'preview'>(
    subscriptionActive || isTest ? 'preview' : 'status'
  )

  const joinDate = new Date(joinDateString)

  return (
    <div className="bg-glass-panel border border-glass-stroke p-6 rounded-2xl flex flex-col h-full min-h-[460px] justify-between relative overflow-hidden group">
      {/* Absolute background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      
      <div>
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-glass-stroke pb-4 mb-6">
          <h3 className="text-sm font-bold text-white font-sora tracking-wider uppercase flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-electric-lime" />
            MEMBERSHIP
          </h3>
          
          <div className="flex bg-deep-obsidian/60 p-0.5 rounded-lg border border-glass-stroke text-[10px] font-mono tracking-wider">
            {!subscriptionActive && !isTest && (
              <button
                onClick={() => setActiveTab('status')}
                className={`px-3 py-1.5 rounded-md uppercase transition-all duration-300 ${
                  activeTab === 'status'
                    ? 'bg-electric-lime text-deep-obsidian font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Status
              </button>
            )}
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md uppercase transition-all duration-300 ${
                activeTab === 'preview' || subscriptionActive || isTest
                  ? 'bg-electric-lime text-deep-obsidian font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Card Preview
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'status' && !subscriptionActive && !isTest ? (
          <div className="flex flex-col flex-1 justify-between py-2">
            <div>
              <div className="flex items-center gap-2 text-apex-crimson font-mono text-xs uppercase tracking-wider mb-3">
                <ShieldAlert className="w-4 h-4" /> Inactive Subscription
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Your elite membership requires activation. Proceed to the secure payment portal to unlock full facility access and activate your digital member ID card.
              </p>
            </div>
            
            <div className="mt-8 space-y-3">
              <Link
                href="/services"
                className="block w-full py-3 bg-electric-lime text-deep-obsidian font-bold tracking-widest uppercase text-xs rounded-lg hover:bg-white transition-all duration-300 shadow-[0_0_15px_rgba(223,255,17,0.2)] text-center font-mono"
              >
                Initialize Payment
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-between relative">
            {/* ID Card Display */}
            <div className="relative">
              <DigitalCard
                memberId={memberId}
                fullName={fullName}
                age={age}
                gender={gender}
                joinDate={joinDate}
                periodStayMonths={periodStayMonths}
              />
              
              {/* Inactive Watermark Overlay */}
              {!subscriptionActive && !isTest && (
                <div className="absolute inset-0 bg-deep-obsidian/40 backdrop-blur-[1.5px] rounded-2xl flex flex-col items-center justify-center pointer-events-none border border-apex-crimson/20">
                  <div className="bg-apex-crimson/90 border border-apex-crimson text-white font-mono text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg font-bold scale-105 animate-pulse">
                    SAMPLE PREVIEW — INACTIVE
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/dashboard/card"
                className="w-full py-2.5 bg-white/5 border border-glass-stroke text-white font-bold tracking-wider uppercase text-[10px] font-mono rounded-lg hover:bg-electric-lime hover:text-deep-obsidian transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Standalone Card
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
