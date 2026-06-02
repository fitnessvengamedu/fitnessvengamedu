"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Flame } from "lucide-react";

export default function Services() {
  const plans = [
    {
      name: "Monthly Core",
      price: "$49",
      period: "/month",
      features: ["Full 24/7 gym access", "All standard group classes", "Locker & biometric access", "1 Pro Bio-evaluation"],
      popular: false,
      glow: "hover:box-glow-lime hover:border-electric-lime/30",
      accent: "text-white",
      iconColor: "text-electric-lime",
      btnStyle: "secondary-btn py-4 w-full text-center"
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
      glow: "box-glow-lime border-electric-lime/40 scale-105 z-10 bg-electric-lime/5",
      accent: "text-electric-lime",
      iconColor: "text-electric-lime",
      btnStyle: "primary-btn py-4 w-full text-center shadow-[0_0_20px_rgba(223,255,17,0.3)]"
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
      glow: "hover:box-glow-lime hover:border-electric-lime/30",
      accent: "text-white",
      iconColor: "text-electric-lime",
      btnStyle: "secondary-btn py-4 w-full text-center"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-24 bg-deep-obsidian">
      <div className="text-center mb-24 max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tighter font-sora text-white leading-tight mb-4"
        >
          APEX <span className="text-electric-lime text-glow">SUBSCRIPTION PROTOCOLS</span>
        </motion.h1>
        <p className="text-white/60 text-base leading-relaxed">
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
            className={`relative glass-card flex flex-col p-10 transition-all duration-500 ease-out border border-glass-stroke ${plan.glow}`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-electric-lime text-deep-obsidian px-5 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(223,255,17,0.4)] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-deep-obsidian animate-bounce" /> MOST POPULAR
              </div>
            )}
            
            <h3 className="text-2xl font-bold font-sora text-white mb-3">
              {plan.name}
            </h3>
            
            <div className="mb-8">
              <span className={`text-5xl font-extrabold font-sora ${plan.accent}`}>{plan.price}</span>
              <span className="text-white/40 font-mono text-xs">{plan.period}</span>
            </div>
            
            <ul className="flex-1 space-y-5 mb-10 text-left font-sans">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-3 text-sm">
                  <Check className={`w-5 h-5 shrink-0 ${plan.iconColor}`} />
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/signup" className={`${plan.btnStyle}`}>
              Initiate Plan
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
