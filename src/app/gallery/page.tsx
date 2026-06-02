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
        {[
          {
            id: "FRAME-001",
            image: "/images/gym_1.jpg",
            status: "LIVE - STRENGTH ZONE",
            title: "KINETIC APEX GEAR",
            metrics: "ISO: 400 | F/2.8 | EXP: 1/120s",
            data: "WEIGHT PROTOCOL ACTIVE [85KG]"
          },
          {
            id: "FRAME-002",
            image: "/images/gym_2.jpg",
            status: "LIVE - POWER CORE",
            title: "IRON POWER PROTOCOL",
            metrics: "ISO: 800 | F/2.0 | EXP: 1/200s",
            data: "HIGH METALLIC DENSITY | SPARK CH: 02"
          },
          {
            id: "FRAME-003",
            image: "",
            status: "BUFFERING",
            title: "CARDIO LAB STREAM",
            metrics: "STREAMING CH 03",
            data: "Awaiting next sync cycle..."
          },
          {
            id: "FRAME-004",
            image: "",
            status: "BUFFERING",
            title: "RECOVERY BAY 1",
            metrics: "STREAMING CH 04",
            data: "Awaiting next sync cycle..."
          },
          {
            id: "FRAME-005",
            image: "",
            status: "BUFFERING",
            title: "BIOMETRIC LAB B",
            metrics: "STREAMING CH 05",
            data: "Awaiting next sync cycle..."
          },
          {
            id: "FRAME-006",
            image: "",
            status: "BUFFERING",
            title: "NEURAL HUB",
            metrics: "STREAMING CH 06",
            data: "Awaiting next sync cycle..."
          }
        ].map((item, index) => (
          <div key={index} className="glass-card overflow-hidden group border border-glass-stroke aspect-video relative flex flex-col justify-between p-6 hover:border-electric-lime/30 transition-all duration-300">
            {item.image ? (
              <>
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700 z-0" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-obsidian via-deep-obsidian/30 to-transparent z-10" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-electric-lime/5 via-transparent to-transparent opacity-30 z-0" />
            )}
            
            <div className="flex justify-between items-start z-20">
              <span className="font-mono text-[9px] uppercase tracking-widest bg-white/5 border border-glass-stroke px-2 py-0.5 rounded text-white/60">
                {item.id}
              </span>
              <div className={`w-2.5 h-2.5 rounded-full ${item.image ? 'bg-electric-lime shadow-[0_0_10px_rgba(223,255,17,0.6)]' : 'bg-white/20'} animate-pulse`} />
            </div>
            
            <div className="space-y-1.5 z-20">
              <p className="font-mono text-[9px] text-electric-lime uppercase tracking-widest font-bold">
                {item.status}
              </p>
              <h4 className="text-sm font-bold font-sora text-white tracking-wide uppercase">
                {item.title}
              </h4>
              <p className="font-mono text-[8px] text-white/40 uppercase tracking-widest">
                {item.metrics}
              </p>
              <p className="font-mono text-[9px] text-white/60 truncate">
                {item.data}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
