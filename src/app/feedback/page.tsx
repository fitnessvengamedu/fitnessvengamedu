'use client'

import { ExternalLink } from "lucide-react";

export default function FeedbackPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center px-4 py-16 md:py-24 relative overflow-hidden bg-deep-obsidian">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-lime/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white font-sora tracking-tight">
            MEMBER <span className="text-electric-lime text-glow">FEEDBACK</span>
          </h1>
          <p className="text-white/50 text-xs sm:text-sm mt-3 sm:mt-4 font-mono uppercase tracking-widest max-w-2xl mx-auto">
            Your input drives our evolution. Submit your performance reports, facility feedback, and system requests.
          </p>
        </div>

        {/* Call to Action for opening form directly */}
        <div className="flex justify-center mb-8">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScz7kW9elEF29aduVx0y7BK6IC-PowhSoH6-LZd3-YzUpLUmA/viewform?usp=sf_link"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-electric-lime text-deep-obsidian hover:bg-electric-lime/90 font-mono text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(223,255,17,0.3)] hover:shadow-[0_0_25px_rgba(223,255,17,0.5)] border border-electric-lime"
          >
            Open Form in New Tab <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="w-full bg-glass-panel border border-glass-stroke rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl h-[550px] sm:h-[750px]">
          <iframe 
            src="https://docs.google.com/forms/d/e/1FAIpQLScz7kW9elEF29aduVx0y7BK6IC-PowhSoH6-LZd3-YzUpLUmA/viewform?embedded=true" 
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
