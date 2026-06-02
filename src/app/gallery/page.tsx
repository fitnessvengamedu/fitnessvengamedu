"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, RefreshCw } from "lucide-react";

export default function Gallery() {
  return (
    <div className="container mx-auto px-4 py-24 bg-background">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold mb-4 tracking-wide"
        >
          Apex <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-pink text-glow-blue">Event Telemetry</span>
        </motion.h1>
        <p className="text-white/60 max-w-2xl mx-auto text-lg">
          Synchronizing real-time event logs, powerlifting galleries, and workout capture feeds.
        </p>
      </div>

      {/* Pulsing Sync State card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="glass-card p-12 flex flex-col items-center justify-center min-h-[300px] text-center mb-16 box-glow-blue border-neon-blue/20"
      >
        <RefreshCw className="w-12 h-12 text-neon-blue mb-6 animate-spin" />
        <h2 className="text-2xl font-bold mb-2">Automated Asset Pipeline</h2>
        <p className="text-white/60 max-w-md">
          Connecting to remote Google Drive event directories via Supabase Storage triggers...
        </p>
        <p className="text-neon-pink text-sm mt-4 tracking-widest font-bold uppercase text-glow-pink">
          Listening for Admin Asset Push
        </p>
      </motion.div>

      {/* Empty gallery slots with neon borders to represent grid awaiting load */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3, y: 15 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4
            }}
            className="h-64 rounded-2xl border border-white/5 bg-white/2 flex flex-col items-center justify-center relative overflow-hidden group hover:border-neon-blue/20 hover:bg-white/5 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-neon-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <ImageIcon className="w-8 h-8 text-white/10 group-hover:text-neon-blue/30 transition-colors" />
            <span className="text-xs text-white/20 mt-3 tracking-wider uppercase font-medium group-hover:text-white/40">
              Channel [{i + 1}] Awaiting Feed
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
