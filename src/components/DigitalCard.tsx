import { ShieldCheck } from 'lucide-react'

interface DigitalCardProps {
  memberId: string
  fullName: string
  age: string
  gender: string
  joinDate: Date
  periodStayMonths: number
}

export default function DigitalCard({
  memberId,
  fullName,
  age,
  gender,
  joinDate,
  periodStayMonths
}: DigitalCardProps) {
  
  // Calculate End Date
  const endDate = new Date(joinDate)
  endDate.setMonth(endDate.getMonth() + periodStayMonths)
  
  // Format MM/YY for card expiry display
  const formatExpiry = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${month}/${year}`
  }

  const memberSince = formatExpiry(joinDate)
  const validThru = formatExpiry(endDate)

  const periodStayString = 
    periodStayMonths === 1 ? 'Monthly' :
    periodStayMonths === 3 ? 'Quarterly' :
    periodStayMonths === 6 ? 'Half-Yearly' :
    periodStayMonths === 12 ? 'Yearly' : `${periodStayMonths} Months`

  // Format 4-digit card number
  const formattedCardNumber = memberId ? String(memberId).padStart(4, '0') : '0000'

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[1.586/1] bg-gradient-to-br from-[#1c1c1e] via-[#0d0d0e] to-[#010101] border border-glass-stroke rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(223,255,17,0.15)] group transition-transform hover:scale-[1.02] duration-300 select-none">
      {/* Background Metallic Glare & Holographic Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-electric-lime/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-apex-crimson/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      {/* Carbon fiber grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      {/* Shimmer light swipe animation effect */}
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

      <div className="relative h-full flex flex-col p-4 md:p-5 z-10 justify-between">
        
        {/* Header: S Fitness logo & Contactless Indicator */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-white font-sora tracking-tighter uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-electric-lime" />
              S FITNESS <span className="text-electric-lime text-[8px] tracking-widest font-mono font-bold bg-electric-lime/10 px-1 py-0.5 rounded border border-electric-lime/20">ELITE</span>
            </h3>
          </div>
          
          {/* Contactless symbol waves */}
          <div className="flex items-center gap-[3px] opacity-75">
            <div className="w-[1.5px] h-[7px] bg-white/40 rounded-full" />
            <div className="w-[2px] h-[10px] bg-white/60 rounded-full" />
            <div className="w-[2px] h-[13px] bg-white/80 rounded-full" />
            <div className="w-[2.5px] h-[16px] bg-white/95 rounded-full" />
          </div>
        </div>

        {/* EMV Gold Chip */}
        <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-300 via-yellow-100 to-amber-600 p-[1.2px] relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.4)] flex-shrink-0 mt-1">
          {/* Internal Chip Details */}
          <div className="absolute inset-0 flex flex-col justify-between p-[2px]">
            <div className="flex justify-between h-[1px] bg-amber-900/40 w-full" />
            <div className="flex justify-between h-[1px] bg-amber-900/40 w-full" />
            <div className="flex justify-between h-[1px] bg-amber-900/40 w-full" />
          </div>
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-amber-900/40 -translate-x-1/2" />
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-amber-900/40 -translate-y-1/2" />
          <div className="absolute w-3.5 h-3.5 rounded-sm border border-amber-900/25 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-yellow-200 to-amber-400" />
        </div>

        {/* 4-Digit Card Number (Embossed Effect) */}
        <div className="my-1 select-text">
          <p 
            className="text-lg md:text-xl font-mono tracking-[0.25em] text-white/90 font-bold"
            style={{ 
              textShadow: '1px 1px 0px rgba(255, 255, 255, 0.15), -1px -1px 0px rgba(0, 0, 0, 0.8)',
              fontFamily: '"Courier New", Courier, monospace'
            }}
          >
            {formattedCardNumber}
          </p>
        </div>

        {/* Cardholder name & Dates/Details */}
        <div className="flex justify-between items-end mt-auto">
          <div className="space-y-0.5 flex-1 min-w-0">
            {/* Cardholder Name */}
            <p className="text-[7px] text-white/40 font-mono tracking-widest uppercase leading-none">CARDHOLDER</p>
            <p 
              className="text-xs font-bold text-white uppercase font-mono tracking-wider truncate leading-tight mt-0.5"
              style={{ textShadow: '-1px -1px 0px rgba(0,0,0,0.5), 1px 1px 0px rgba(255,255,255,0.05)' }}
            >
              {fullName}
            </p>
            
            {/* Member telemetry printed below name */}
            <div className="flex items-center gap-1.5 text-[8px] text-white/50 font-mono uppercase tracking-wider mt-1 leading-none">
              <span>AGE: <span className="text-white/80 font-bold">{age || 'N/A'}</span></span>
              <span>•</span>
              <span>SEX: <span className="text-white/80 font-bold">{gender ? gender.substring(0, 6) : 'N/A'}</span></span>
              <span>•</span>
              <span>PLAN: <span className="text-white/80 font-bold">{periodStayString}</span></span>
            </div>
          </div>

          {/* Dates & Hologram */}
          <div className="flex items-center gap-3.5 flex-shrink-0 ml-2">
            {/* Expiry Dates */}
            <div className="flex gap-2.5 text-left">
              <div>
                <p className="text-[6px] text-white/40 font-mono tracking-wider uppercase leading-none">SINCE</p>
                <p className="text-[10px] font-mono font-bold text-white/80 mt-0.5">{memberSince}</p>
              </div>
              <div>
                <p className="text-[6px] text-electric-lime/60 font-mono tracking-wider uppercase leading-none">THRU</p>
                <p className="text-[10px] font-mono font-black text-electric-lime mt-0.5">{validThru}</p>
              </div>
            </div>

            {/* Rainbow Hologram Badge */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-400 to-yellow-300 opacity-80 relative overflow-hidden flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,transparent_30%,rgba(0,0,0,0.4))] pointer-events-none" />
              <ShieldCheck className="w-4 h-4 text-white/90 mix-blend-difference" />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
