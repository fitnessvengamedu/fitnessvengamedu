"use client";

import { motion } from "framer-motion";
import { Shield, Award, HeartPulse } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 bg-deep-obsidian">
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 md:mb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-3 text-electric-lime font-mono text-xs uppercase tracking-[0.3em]">
            <div className="h-[1px] w-8 bg-electric-lime" />
            <span>Facility Overview</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] font-sora text-white">
            OUR LEGACY OF <br />
            <span className="text-electric-lime text-glow font-extrabold">STRENGTH & GRIT</span>
          </h1>
          <div className="space-y-6 text-white/60 leading-relaxed text-base">
            <p>
              {process.env.NEXT_PUBLIC_APP_NAME || "S FITNESS"} was established with one core mission: to forge resilience, strength, and raw capability in every individual. We are not just a fitness center; we are a testing ground for limits.
            </p>
            <p>
              We provide state-of-the-art WebGL equipment telemetry, elite expert mentorship, and an immersive dark-first aesthetic specifically crafted to stimulate focus and push performance metrics to new heights.
            </p>
          </div>
        </motion.div>

        {/* 3D replaced with High-fidelity camera frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative flex items-center justify-center h-[260px] sm:h-[350px] md:h-[450px] rounded-3xl bg-white/2 border border-glass-stroke shadow-[0_0_40px_rgba(223,255,17,0.03)] overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-electric-lime/10 via-transparent to-apex-crimson/5 opacity-50 z-10 pointer-events-none group-hover:opacity-80 transition-opacity" />
          <img 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 z-0" 
            src="/images/gym_2.jpg"
            alt="Apex Studio Equipment"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-obsidian via-transparent to-transparent z-10" />

          {/* Diagnostic Overlay HUD */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2 bg-deep-obsidian/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-glass-stroke">
            <span className="w-2.5 h-2.5 rounded-full bg-apex-crimson animate-ping" />
            <span className="font-mono text-[9px] text-white uppercase tracking-wider font-bold">REC: CHAMBER CH-02</span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 bg-deep-obsidian/85 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-glass-stroke space-y-2">
            <div className="flex justify-between items-center text-[8px] font-mono text-white/40">
              <span>SYSTEM DIAGNOSTIC: READY</span>
              <span>10.2 FPS</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-electric-lime font-bold tracking-widest uppercase">
                LOAD RATIO OK
              </span>
              <span className="font-mono text-[9px] text-white/60">
                TEMP: 21°C
              </span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-electric-lime" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Core Values Section */}
      <div className="max-w-7xl mx-auto mb-16 md:mb-24">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-center font-sora text-white mb-10 md:mb-16 tracking-tight">
          OUR <span className="text-electric-lime text-glow">CORE PROTOCOLS</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Absolute Safety",
              desc: "Uncompromising support systems and form diagnostics for risk-free progression.",
              glow: "hover:border-electric-lime/30 hover:box-glow-lime",
              color: "text-electric-lime"
            },
            {
              icon: Award,
              title: "Elite Standards",
              desc: "Train under certified champions utilizing science-backed methodologies.",
              glow: "hover:border-apex-crimson/30 hover:box-glow-crimson",
              color: "text-apex-crimson"
            },
            {
              icon: HeartPulse,
              title: "Holistic Health",
              desc: "A balanced synthesis of high-octane biomechanics, dietary design, and recovery.",
              glow: "hover:border-electric-lime/30 hover:box-glow-lime",
              color: "text-electric-lime"
            }
          ].map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className={`glass-card p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 ${value.glow}`}
            >
              <div className={`w-16 h-16 rounded-xl bg-white/5 border border-glass-stroke flex items-center justify-center mb-6 ${value.color}`}>
                <value.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-sora text-white mb-4">{value.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
