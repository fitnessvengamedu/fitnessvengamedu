"use client";

import { motion } from "framer-motion";
import GymCanvas3D from "@/components/GymCanvas3D";
import { Shield, Award, HeartPulse } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-24 bg-background">
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-glow-blue leading-tight">
            Our Legacy of <br />
            Strength & Grit
          </h1>
          <div className="space-y-6 text-white/70 leading-relaxed text-lg">
            <p>
              Stitch Apex Elite was established with one core mission: to forge resilience, strength, and raw capability in every individual. We are not just a fitness center; we are a testing ground for limits.
            </p>
            <p>
              We provide state-of-the-art WebGL equipment telemetry, elite expert mentorship, and an immersive dark-first aesthetic specifically crafted to stimulate focus and push performance metrics to new heights.
            </p>
          </div>
        </motion.div>

        {/* 3D Model Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex items-center justify-center h-[350px] md:h-[450px] rounded-3xl bg-white/2 border border-white/5 shadow-[0_0_40px_rgba(255,0,127,0.05)] overflow-hidden"
        >
          <GymCanvas3D />
        </motion.div>
      </div>

      {/* Core Values Section */}
      <div className="mb-24">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 tracking-wide">
          Our <span className="text-neon-pink text-glow-pink">Core Protocols</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Absolute Safety",
              desc: "Uncompromising support systems and form diagnostics for risk-free progression.",
              glow: "box-glow-blue",
              color: "text-neon-blue"
            },
            {
              icon: Award,
              title: "Elite Standards",
              desc: "Train under certified champions utilizing science-backed methodologies.",
              glow: "box-glow-pink",
              color: "text-neon-pink"
            },
            {
              icon: HeartPulse,
              title: "Holistic Health",
              desc: "A balanced synthesis of high-octane biomechanics, dietary design, and recovery.",
              glow: "box-glow-blue",
              color: "text-neon-purple"
            }
          ].map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className={`glass-card-interactive p-8 flex flex-col items-center text-center ${value.glow}`}
            >
              <div className={`w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 ${value.color}`}>
                <value.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
              <p className="text-white/60 leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
