'use client'

import { useState } from 'react'
import { ShieldCheck, RotateCw, Printer, AlertTriangle, Download } from 'lucide-react'
import DigitalCard from './DigitalCard'

interface StandaloneCardViewerProps {
  details: {
    memberId: string
    fullName: string
    age: string
    gender: string
    joinDateString: string
    periodStayMonths: number
    subscriptionActive: boolean
    isTest: boolean
  }
}

export default function StandaloneCardViewer({ details }: StandaloneCardViewerProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [isDownloading, setIsDownloading] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    // Divide by divisor to control tilt intensity
    setRotate({
      x: -y / 15,
      y: x / 15
    })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const targetId = isFlipped ? 'digital-card-back' : 'digital-card-front'
      const element = document.getElementById(targetId)
      if (!element) return

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 3,
        style: {
          transform: 'none',
          borderRadius: '16px',
        }
      })

      const link = document.createElement('a')
      link.download = `s-fitness-${isFlipped ? 'back' : 'front'}-${details.memberId}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to download card:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const joinDate = new Date(details.joinDateString)

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg print:gap-0">
      {/* 3D Perspective Wrapper */}
      <div 
        className="w-full aspect-[1.586/1] cursor-pointer"
        style={{ perspective: '1200px' }}
      >
        {/* Flippable Card Container */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-full transition-transform duration-700 ease-out preserve-3d shadow-2xl"
          style={{
            transform: `rotateY(${isFlipped ? 180 : rotate.y}deg) rotateX(${isFlipped ? 0 : rotate.x}deg)`
          }}
        >
          {/* Front Side */}
          <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden" id="digital-card-front">
            <DigitalCard
              memberId={details.memberId}
              fullName={details.fullName}
              age={details.age}
              gender={details.gender}
              joinDate={joinDate}
              periodStayMonths={details.periodStayMonths}
            />
            {!details.subscriptionActive && !details.isTest && (
              <div className="absolute inset-0 bg-deep-obsidian/45 backdrop-blur-[1.5px] flex items-center justify-center pointer-events-none border border-apex-crimson/25 rounded-2xl">
                <div className="bg-apex-crimson text-white font-mono text-xs uppercase tracking-widest px-4 py-1.5 rounded-full font-bold shadow-2xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                  INACTIVE PREVIEW CARD
                </div>
              </div>
            )}
          </div>

          {/* Back Side (180deg Rotated) */}
          <div 
            id="digital-card-back"
            className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-[#121212] via-[#0d0d0d] to-[#050505] border border-glass-stroke p-5 flex flex-col justify-between overflow-hidden shadow-inner text-white"
            style={{ transform: 'rotateY(180deg)' }}
          >
            {/* Background metallic shimmer */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-electric-lime/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Black Magnetic Stripe */}
            <div className="absolute top-4 left-0 w-full h-9 bg-neutral-900 border-y border-neutral-950 flex items-center px-6">
              <div className="w-full h-2 bg-neutral-800 rounded-sm opacity-50" />
            </div>

            {/* Signature Area & Auth Badge */}
            <div className="mt-12 flex justify-between items-center gap-4">
              <div className="flex-1">
                <p className="text-[6px] text-white/30 font-mono tracking-wider uppercase mb-1">Authorized Signature</p>
                <div className="h-7 w-full bg-neutral-100/90 rounded border border-white/10 px-3 flex items-center justify-between text-neutral-900 font-mono italic text-[11px] font-bold">
                  {details.fullName}
                  <span className="text-[8px] not-italic text-neutral-400 font-mono font-normal">CVV: 000</span>
                </div>
              </div>

              {/* Holographic Badge */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b3b3f] to-[#121214] border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-electric-lime" />
              </div>
            </div>

            {/* Simulated Access Control Barcode */}
            <div className="flex flex-col items-center gap-1 my-2">
              <div className="bg-white p-1.5 rounded flex items-center justify-center gap-[1.5px] h-10 w-52 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]">
                {[3, 1, 4, 1, 5, 2, 6, 2, 5, 1, 3, 5, 2, 8, 1, 9, 2, 7, 1, 9, 3, 2, 3, 2, 8, 1, 4, 2, 6].map((w, i) => (
                  <div key={i} className="bg-black h-full" style={{ width: `${w}px` }} />
                ))}
              </div>
              <span className="text-[8px] font-mono tracking-widest text-white/50 uppercase">PASS ID: {details.memberId}</span>
            </div>

            {/* Terms & Footer */}
            <div className="flex justify-between items-end text-[5px] text-white/30 font-mono uppercase tracking-wider leading-normal border-t border-glass-stroke/40 pt-2.5">
              <span className="max-w-[70%]">
                VALID ONLY AT S FITNESS APEX ELITE LOCATIONS. PASS IS NON-TRANSFERABLE AND SUBJECT TO ALL MEMBERSHIP CONDITIONS AND FACILITY REGULATIONS.
              </span>
              <span className="text-electric-lime font-bold">
                APEX ELITE v1.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons (Hidden when printing) */}
      <div className="flex gap-4 w-full justify-center print:hidden flex-wrap">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-2 px-5 py-3 border border-glass-stroke hover:border-white/20 text-white bg-white/5 font-mono text-xs uppercase tracking-wider rounded-lg transition-colors font-bold"
        >
          <RotateCw className="w-4 h-4 text-electric-lime" />
          Flip Card
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-glass-stroke hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider rounded-lg transition-colors font-bold"
        >
          <Printer className="w-4 h-4 text-electric-lime" />
          Print Pass
        </button>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-5 py-3 bg-electric-lime hover:bg-white text-deep-obsidian disabled:opacity-50 font-mono text-xs uppercase tracking-wider rounded-lg transition-colors font-bold shadow-[0_0_15px_rgba(223,255,17,0.2)]"
        >
          <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
          {isDownloading ? 'Downloading...' : 'Download Card'}
        </button>
      </div>

      {/* Print styles applied dynamically */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:p-0, .print\\:p-0 * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .backface-hidden {
            backface-visibility: visible !important;
          }
        }
      `}</style>
    </div>
  )
}
