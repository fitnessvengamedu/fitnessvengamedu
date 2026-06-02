"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Users, Star, Sparkles } from "lucide-react";
import GymCanvas3D from "@/components/GymCanvas3D";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full bg-background min-h-screen">
      
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden px-4 md:px-8 py-12">
        {/* Background gradient blurs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] -z-10 animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[150px] -z-10" />
        
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
          
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(0,240,255,0.15)] mb-8">
              <span className="flex h-2. w-2 rounded-full bg-neon-blue animate-pulse" />
              <span className="text-sm font-medium text-white/80 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-neon-pink" /> Forge Your Elite Physique
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Shred Your <br />
              Limits at <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-glow-blue">
                Stitch Apex Elite
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 mb-12 leading-relaxed">
              Step into the future of fitness. Our futuristic dark-first aesthetic, interactive tracking, 
              and state-of-the-art WebGL training visualizers are built to fuel your discipline.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href="/signup" 
                className="primary-button flex items-center gap-2 text-lg w-full sm:w-auto justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]"
              >
                Get Access Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/services" className="glass-button text-lg w-full sm:w-auto justify-center hover:text-neon-pink transition-colors duration-300">
                Explore Tiers
              </Link>
            </div>
          </motion.div>
          
          {/* Hero 3D WebGL Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="flex items-center justify-center w-full h-[400px] lg:h-[550px] rounded-3xl bg-white/2 backdrop-blur-sm border border-white/5 shadow-[0_0_50px_rgba(0,240,255,0.05)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-neon-blue/5 via-transparent to-neon-pink/5 opacity-50 pointer-events-none" />
            <GymCanvas3D />
          </motion.div>

        </div>
      </section>

      {/* Decorative neon dividing line */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50 shadow-[0_0_10px_#00f0ff]" />

      {/* Features Section */}
      <section className="w-full py-32 bg-black/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-wide">
              The <span className="text-neon-blue text-glow-blue">Next Gen</span> Gym Experience
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto text-lg">
              Engineered with premium facilities, biomechanical analysis, and a relentless community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Activity, 
                title: "WebGL Analytics", 
                desc: "Real-time biomechanical telemetry to correct form and track performance.",
                glow: "box-glow-blue",
                color: "text-neon-blue"
              },
              { 
                icon: Users, 
                title: "Elite Mentorship", 
                desc: "Certified professionals and personal trainers crafting custom routines.",
                glow: "box-glow-pink",
                color: "text-neon-pink"
              },
              { 
                icon: Star, 
                title: "Apex Atmosphere", 
                desc: "A futuristic dark-mode environment powered by premium acoustics and neon design.",
                glow: "box-glow-blue",
                color: "text-neon-purple"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className={`glass-card-interactive p-10 flex flex-col items-center text-center ${feature.glow}`}
              >
                <div className={`w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 ${feature.color}`}>
                  <feature.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative neon dividing line */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-neon-pink to-transparent opacity-50 shadow-[0_0_10px_#ff007f]" />

      {/* Google Reviews Section */}
      <section className="w-full py-32">
         <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-16 tracking-wide">
              Validated By <span className="text-neon-pink text-glow-pink">Our Athletes</span>
            </h2>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-16 max-w-4xl mx-auto flex items-center justify-center min-h-[350px] box-glow-pink border-pink-500/10"
            >
               <div className="flex flex-col items-center gap-6">
                 <div className="flex items-center gap-1.5">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} className="w-8 h-8 fill-neon-pink text-neon-pink shadow-[0_0_10px_#ff007f]" />
                   ))}
                 </div>
                 <p className="text-2xl text-white/80 italic font-light max-w-2xl leading-relaxed">
                   "Stitch Apex Elite is hands down the best training space. The aesthetic alone drives you to pull extra weight, and the tracking tech actually works."
                 </p>
                 <span className="text-sm font-semibold tracking-wider text-neon-blue uppercase mt-4">
                   - Alex Vance, Certified Powerlifter
                 </span>
               </div>
            </motion.div>
         </div>
      </section>
      
    </div>
  );
}
