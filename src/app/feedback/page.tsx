'use client'

export default function FeedbackPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center px-4 py-16 md:py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-lime/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white font-sora tracking-tight">
            MEMBER <span className="text-electric-lime text-glow">FEEDBACK</span>
          </h1>
          <p className="text-white/50 text-xs sm:text-sm mt-3 sm:mt-4 font-inter max-w-2xl mx-auto">
            Your input drives our evolution. Submit your performance reports, facility feedback, and system improvement requests directly to the Apex Elite command center.
          </p>
        </div>

        <div className="w-full bg-glass-panel border border-glass-stroke rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl h-[550px] sm:h-[800px]">
          {/* 
            TODO FOR THE GYM OWNER:
            Replace the "src" URL below with your actual Google Form embed link!
            To get your link: 
            1. Open your Google Form
            2. Click "Send" in the top right
            3. Click the "< >" icon
            4. Copy the link inside the "src" quotation marks
          */}
          <iframe 
            src="https://forms.gle/G1risZ8LfWDL7Mi69" 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            marginHeight={0} 
            marginWidth={0}
            className="w-full h-full bg-white/5"
          >
            Loading Feedback Form...
          </iframe>
        </div>
      </div>
    </div>
  )
}
