"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Flame, Star, ShieldAlert } from "lucide-react";

export default function Services() {
  const plans = [
    {
      name: "Monthly Core",
      price: "$49",
      period: "/month",
      features: ["Full 24/7 gym access", "All standard group classes", "Locker & biometric access", "1 Pro Bio-evaluation"],
      popular: false,
      glow: "hover:box-glow-blue hover:border-neon-blue/30",
      accent: "text-neon-blue",
      btnStyle: "glass-button"
    },
    {
      name: "Apex Elite (6-Months)",
      price: "$39",
      period: "/month",
      features: [
        "All Monthly features",
        "Personal diet customization",
        "Bi-weekly body telemetry reports",
        "3 Personal coaching sessions",
        "1 Free guest pass monthly"
      ],
      popular: true,
      glow: "box-glow-pink border-neon-pink/40 scale-105 z-10",
      accent: "text-neon-pink",
      btnStyle: "primary-button shadow-[0_0_20px_rgba(255,0,127,0.3)] hover:shadow-[0_0_30px_rgba(255,0,127,0.6)]"
    },
    {
      name: "Yearly Immortal",
      price: "$29",
      period: "/month",
      features: [
        "All Half-Yearly features",
        "Unlimited custom trainer bookings",
        "Priority VIP locker suite",
        "Free official gym armor (merch)",
        "Lifetime pricing locks"
      ],
      popular: false,
      glow: "hover:box-glow-blue hover:border-neon-blue/30",
      accent: "text-neon-blue",
      btnStyle: "glass-button"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-24 bg-background">
      <div className="text-center mb-24">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold mb-4 tracking-wide"
        >
          Apex <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-pink text-glow-blue">Subscription Protocols</span>
        </motion.h1>
        <p className="text-white/60 max-w-2xl mx-auto text-lg">
          Select your training access protocol. Unlock advanced tracking, elite coaches, and premium facilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto items-stretch">
        {plans.map((plan, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            className={`relative glass-card flex flex-col p-10 transition-all duration-500 ease-out border border-white/10 ${plan.glow}`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neon-pink text-white px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_#ff007f] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-white animate-bounce" /> MOST POPULAR
              </div>
            )}
            
            <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
              {plan.name}
            </h3>
            
            <div className="mb-8">
              <span className={`text-5xl font-extrabold ${plan.accent}`}>{plan.price}</span>
              <span className="text-white/40 font-medium">{plan.period}</span>
            </div>
            
            <ul className="flex-1 space-y-5 mb-10 text-left">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-3 text-sm">
                  <Check className={`w-5 h-5 shrink-0 ${plan.accent}`} />
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/signup" className={`w-full text-center py-4 rounded-full font-bold tracking-wide transition-all ${plan.btnStyle}`}>
              Initiate Plan
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
