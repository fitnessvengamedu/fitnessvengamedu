"use client";

import { motion } from "framer-motion";
import GymCanvas3D from "@/components/GymCanvas3D";
import { Shield, Award, HeartPulse } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-24 bg-deep-obsidian">
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 max-w-7xl mx-auto">
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
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] font-sora text-white">
            OUR LEGACY OF <br />
            <span className="text-electric-lime text-glow font-extrabold">STRENGTH & GRIT</span>
          </h1>
          <div className="space-y-6 text-white/60 leading-relaxed text-base">
            <p>
              STITCH APEX ELITE was established with one core mission: to forge resilience, strength, and raw capability in every individual. We are not just a fitness center; we are a testing ground for limits.
            </p>
            <p>
              We provide state-of-the-art WebGL equipment telemetry, elite expert mentorship, and an immersive dark-first aesthetic specifically crafted to stimulate focus and push performance metrics to new heights.
            </p>
          </div>
        </motion.div>

        {/* 3D Model Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex items-center justify-center h-[350px] md:h-[450px] rounded-3xl bg-white/2 border border-glass-stroke shadow-[0_0_40px_rgba(223,255,17,0.03)] overflow-hidden"
        >
          <GymCanvas3D />
        </motion.div>
      </div>

      {/* Core Values Section */}
      <div className="max-w-7xl mx-auto mb-24">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center font-sora text-white mb-16 tracking-tight">
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
              className={`glass-card p-8 flex flex-col items-center text-center transition-all duration-300 ${value.glow}`}
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
