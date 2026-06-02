"use client";

import { motion } from "framer-motion";
import { RefreshCw, Play } from "lucide-react";

export default function Gallery() {
  return (
    <div className="container mx-auto px-4 py-24 bg-deep-obsidian">
      {/* Title */}
      <div className="text-center mb-24 max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tighter font-sora text-white leading-tight mb-4"
        >
          TELEMETRY <span className="text-electric-lime text-glow">MEDIA STREAM</span>
        </motion.h1>
        <p className="text-white/60 text-base leading-relaxed">
          Google Drive sync pipeline initialized. Live media feed connected to active event indices.
        </p>
      </div>

      {/* Sync Status dashboard */}
      <div className="max-w-5xl mx-auto glass-card p-8 mb-16 border-l-4 border-l-electric-lime shadow-[0_0_20px_rgba(223,255,17,0.02)]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-lime opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-electric-lime"></span>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-white/40">Status: Active</p>
              <h3 className="text-lg font-bold font-sora text-white">Google Drive Stream Online</h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 border border-glass-stroke hover:border-electric-lime/30 text-white/80 hover:text-white px-5 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all">
              <RefreshCw className="w-3.5 h-3.5" /> Re-sync Stream
            </button>
          </div>
        </div>
      </div>

      {/* Grid boxes / Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="glass-card overflow-hidden group border border-glass-stroke aspect-video relative flex flex-col justify-between p-6">
            <div className="absolute inset-0 bg-gradient-to-tr from-electric-lime/5 via-transparent to-transparent opacity-30 z-0" />
            <div className="flex justify-between items-start z-10">
              <span className="font-mono text-[9px] uppercase tracking-widest bg-white/5 border border-glass-stroke px-2 py-0.5 rounded text-white/60">
                FRAME-{item.toString().padStart(3, '0')}
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-electric-lime animate-pulse shadow-[0_0_10px_rgba(223,255,17,0.6)]" />
            </div>
            <div className="space-y-2 z-10">
              <p className="font-mono text-[9px] text-electric-lime uppercase tracking-widest">Awaiting Media Feed...</p>
              <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
