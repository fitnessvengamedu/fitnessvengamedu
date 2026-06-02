"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import GymCanvas3D from "@/components/GymCanvas3D";
import { Activity, Flame, ShieldAlert, Sparkles, TrendingUp, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full bg-deep-obsidian min-h-screen relative overflow-hidden">
      
      {/* Noise and Scanline overlay */}
      <div className="noise-overlay pointer-events-none absolute inset-0 z-10" />

      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden px-4 md:px-12 py-20">
        <div className="scanline" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-electric-lime/5 rounded-full blur-[150px] -z-10 animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-apex-crimson/5 rounded-full blur-[150px] -z-10" />

        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-20">
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left space-y-6"
          >
            <div className="inline-flex items-center gap-3 text-electric-lime font-mono text-xs uppercase tracking-[0.3em]">
              <div className="h-[1px] w-8 bg-electric-lime" />
              <span>System Initialized: Apex Elite</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] font-sora text-white">
              TRANSCEND YOUR <br />
              <span className="text-electric-lime text-glow font-extrabold">PHYSICAL PEAK</span>
            </h1>
            
            <p className="text-base md:text-lg text-white/60 leading-relaxed font-sans max-w-xl">
              Experience a new dimension of human performance. We merge elite kinetic coaching with biometric data streams to engineer the ultimate athlete.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/signup" className="primary-btn px-10 py-5 text-sm uppercase font-bold tracking-widest bg-electric-lime text-deep-obsidian rounded-lg shadow-[0_0_20px_rgba(223,255,17,0.3)] hover:shadow-[0_0_30px_rgba(223,255,17,0.6)]">
                Initialize Protocol
              </Link>
              <Link href="/about" className="secondary-btn px-10 py-5 text-sm uppercase font-bold tracking-widest border border-glass-stroke text-white backdrop-blur-md rounded-lg hover:bg-white/10">
                View Facility
              </Link>
            </div>
          </motion.div>

          {/* Floating Telemetry Box or Decorator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative flex items-center justify-center glass-card p-6 h-[400px] md:h-[500px] overflow-hidden"
          >
            {/* Mesh background light */}
            <div className="absolute inset-0 bg-gradient-to-tr from-electric-lime/5 via-transparent to-apex-crimson/5 opacity-40 pointer-events-none" />
            <GymCanvas3D />
          </motion.div>
        </div>
      </section>

      {/* Equipment Showcase Section */}
      <section className="w-full py-24 bg-surface/30 px-4 md:px-12 border-t border-b border-glass-stroke">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* 3D WebGL Dumbbell Model left */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[350px] md:h-[450px] glass-card flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-electric-lime/5 rounded-full blur-[100px]" />
            <GymCanvas3D />
          </motion.div>

          {/* Equipment Copy right */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-electric-lime font-bold">3D Precision Gear</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-sora text-white leading-tight">
              CARBON-FIBER <br />ENGINEERING
            </h2>
            <p className="text-white/60 leading-relaxed font-sans text-base">
              Our facility features exclusively designed carbon-fiber dumbbells and tech-integrated resistance machines. Each piece of equipment communicates directly with your Apex profile to calibrate resistance in real-time.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-l-2 border-electric-lime rounded-xl">
                <p className="font-mono text-[10px] text-white/40 uppercase mb-2">Build Quality</p>
                <p className="text-xl font-bold text-white font-sora">Aerospace Grade</p>
              </div>
              <div className="glass-card p-6 border-l-2 border-electric-lime rounded-xl">
                <p className="font-mono text-[10px] text-white/40 uppercase mb-2">Connectivity</p>
                <p className="text-xl font-bold text-white font-sora">Live Telemetry</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento grid section */}
      <section className="w-full py-32 px-4 md:px-12">
        <div className="container mx-auto space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-sora text-white">ELITE CAPABILITIES</h2>
            <div className="h-1 w-24 bg-electric-lime" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Card 1: Kinetic Revolution */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-8 group relative h-[450px] overflow-hidden rounded-xl border border-glass-stroke glass-card flex flex-col justify-end p-8 md:p-10"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-deep-obsidian via-deep-obsidian/40 to-transparent z-10" />
              {/* Fallback image glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-electric-lime/5 via-transparent to-transparent z-0 group-hover:scale-105 transition-transform duration-1000" />
              <div className="relative z-20 space-y-4">
                <span className="font-mono text-[10px] bg-electric-lime/10 text-electric-lime px-3 py-1 rounded-full uppercase tracking-wider font-bold">01 / PERFORMANCE</span>
                <h3 className="text-2xl md:text-4xl font-bold font-sora text-white">KINETIC REVOLUTION</h3>
                <p className="text-white/60 font-sans max-w-md text-sm">
                  Precision-engineered strength cycles developed for world-class athletes and high-performers.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Biometric Mastery */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="md:col-span-4 group relative h-[450px] overflow-hidden rounded-xl border border-glass-stroke glass-card flex flex-col justify-end p-8 md:p-10"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-deep-obsidian via-deep-obsidian/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-apex-crimson/5 via-transparent to-transparent z-0 group-hover:scale-105 transition-transform duration-1000" />
              <div className="relative z-20 space-y-4">
                <span className="font-mono text-[10px] bg-electric-lime/10 text-electric-lime px-3 py-1 rounded-full uppercase tracking-wider font-bold">02 / COACHING</span>
                <h3 className="text-2xl font-bold font-sora text-white">BIOMETRIC MASTERY</h3>
                <p className="text-white/60 font-sans text-sm">
                  Real-time telemetry and motion capture analysis for every session.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Neural Reset */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-12 group relative h-[350px] overflow-hidden rounded-xl border border-glass-stroke glass-card flex items-center p-8 md:p-12"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-deep-obsidian via-deep-obsidian/20 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-electric-lime/5 via-transparent to-transparent z-0 group-hover:scale-105 transition-transform duration-1000" />
              <div className="relative z-20 max-w-xl space-y-4">
                <span className="font-mono text-[10px] bg-electric-lime/10 text-electric-lime px-3 py-1 rounded-full uppercase tracking-wider font-bold">03 / RECOVERY</span>
                <h3 className="text-2xl md:text-4xl font-bold font-sora text-white">NEURAL RESET</h3>
                <p className="text-white/60 font-sans text-sm">
                  Cryogenic and infrared protocols designed to accelerate cellular regeneration and central nervous system recovery.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Telemetry progress & Pricing layout */}
      <section className="relative w-full py-24 bg-surface px-4 md:px-12 border-t border-glass-stroke">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left stats counter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-sora text-white leading-tight">
              TELEMETRY-DRIVEN <br /><span className="text-electric-lime">EVOLUTION</span>
            </h2>
            <p className="text-white/60 leading-relaxed font-sans text-base max-w-md">
              Every heartbeat, power-stroke, and calorie is tracked through our Apex Cloud. We don't guess. We measure, analyze, and optimize your path to the elite tier.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="border-l-2 border-electric-lime pl-4">
                <div className="font-mono text-[10px] text-white/40 uppercase mb-1">VO2 MAX GAIN</div>
                <div className="text-3xl font-extrabold text-white font-sora">+14% avg</div>
              </div>
              <div className="border-l-2 border-electric-lime pl-4">
                <div className="font-mono text-[10px] text-white/40 uppercase mb-1">RECOVERY SPEED</div>
                <div className="text-3xl font-extrabold text-white font-sora">2.4X faster</div>
              </div>
            </div>
          </motion.div>

          {/* Right plans pricing */}
          <div className="space-y-6">
            {/* Core Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-xl border-l-4 border-l-white/20 hover:border-l-electric-lime transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-bold font-sora text-white">CORE</h4>
                  <p className="text-xs text-white/40 mt-1">The entry point to performance.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white">$199</div>
                  <div className="font-mono text-[9px] text-white/40 uppercase">PER MONTH</div>
                </div>
              </div>
            </motion.div>

            {/* Premium Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-xl border-l-4 border-l-electric-lime bg-electric-lime/5 shadow-[0_0_40px_rgba(223,255,17,0.08)] relative"
            >
              <div className="absolute -top-3 right-8 bg-electric-lime text-deep-obsidian px-3 py-1 font-mono text-[9px] font-bold tracking-widest rounded-full uppercase">
                Most Recommended
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-2xl font-bold font-sora text-white">ELITE APEX</h4>
                  <p className="text-xs text-electric-lime/80 mt-1">Full telemetry & dedicated performance director.</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-electric-lime">$499</div>
                  <div className="font-mono text-[9px] text-white/40 uppercase">PER MONTH</div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <div className="h-1 flex-1 bg-electric-lime/20 rounded-full overflow-hidden">
                  <div className="h-full bg-electric-lime w-3/4 animate-pulse" />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* CTA section */}
      <section className="w-full py-32 px-4 md:px-12 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl py-20 px-8 max-w-5xl mx-auto relative overflow-hidden box-glow-lime border-electric-lime/20"
        >
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(223,255,17,0.4)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_5s_infinite_linear]" />
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter font-sora text-white mb-8">
            READY FOR THE NEXT <br /> <span className="text-electric-lime">EVOLUTION?</span>
          </h2>
          <p className="text-white/60 font-sans max-w-xl mx-auto mb-12 text-base md:text-lg">
            The protocol begins when you do. Secure your spot in the apex elite facility today.
          </p>
          <Link href="/signup" className="primary-btn px-12 py-6 text-sm uppercase tracking-[0.2em] font-extrabold shadow-[0_0_40px_rgba(223,255,17,0.3)]">
            Apply for Access
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
