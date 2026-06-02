"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Users, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Background gradient blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-float" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-white/80">Transform Your Life Today</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Push Your Limits at <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Stitch Apex Elite
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            Premium facilities, expert trainers, and a community driven by results. 
            Your journey to peak performance starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="primary-button flex items-center gap-2 text-lg w-full sm:w-auto justify-center">
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/services" className="glass-button text-lg w-full sm:w-auto justify-center">
              View Plans
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Experience fitness like never before with our state-of-the-art facilities and expert guidance.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Modern Equipment", desc: "Top-tier machines and free weights for all training styles." },
              { icon: Users, title: "Expert Trainers", desc: "Certified professionals dedicated to your fitness goals." },
              { icon: Star, title: "Premium Vibe", desc: "A clean, energetic environment to keep you motivated." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-card-interactive p-8 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/60">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews Placeholder Section */}
      <section className="w-full py-24">
         <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">What Our Members Say</h2>
            <div className="glass-card p-12 max-w-3xl mx-auto flex items-center justify-center min-h-[300px]">
               <div className="flex flex-col items-center gap-4">
                 <Star className="w-12 h-12 text-yellow-500" />
                 <p className="text-xl text-white/80 italic">"Google Reviews Widget loading..."</p>
                 <span className="text-sm text-white/50">Integrated via Google Places API</span>
               </div>
            </div>
         </div>
      </section>
      
    </div>
  );
}
