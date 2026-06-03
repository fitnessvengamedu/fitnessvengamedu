"use client";

import { motion } from "framer-motion";
import { Check, Flame, QrCode } from "lucide-react";
import RazorpayCheckoutButton from "@/components/RazorpayCheckoutButton";
import RazorpayQRCode from "@/components/RazorpayQRCode";
import { useEffect, useState } from "react";

export default function Services() {
  const [dynamicPrices, setDynamicPrices] = useState<Record<string, string>>({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('/api/razorpay/plans');
        if (res.ok) {
          const data = await res.json();
          setDynamicPrices(data.prices || {});
        }
      } catch (err) {
        console.error("Failed to fetch Razorpay prices", err);
      } finally {
        setLoadingPrices(false);
      }
    }
    fetchPrices();
  }, []);

  const plans = [
    {
      name: "Monthly Core",
      defaultPrice: "₹1,499",
      period: "/month",
      features: ["Full 24/7 gym access", "All standard group classes", "Locker & biometric access", "1 Pro Bio-evaluation"],
      popular: false,
      glow: "hover:box-glow-lime hover:border-electric-lime/30",
      accent: "text-white",
      iconColor: "text-electric-lime",
      btnStyle: "secondary-btn py-4 w-full text-center",
      planId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY
    },
    {
      name: "Quarterly Advance",
      defaultPrice: "₹3,999",
      period: "/quarter",
      features: ["All Monthly features", "1 Personal coaching session", "Diet plan basics", "Gym merchandise discount"],
      popular: false,
      glow: "hover:box-glow-lime hover:border-electric-lime/30",
      accent: "text-white",
      iconColor: "text-electric-lime",
      btnStyle: "secondary-btn py-4 w-full text-center",
      planId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_QUARTERLY
    },
    {
      name: "Apex Elite (6-Months)",
      defaultPrice: "₹6,999",
      period: "/half-year",
      features: [
        "All Quarterly features",
        "Personal diet customization",
        "Bi-weekly body telemetry reports",
        "3 Personal coaching sessions",
        "1 Free guest pass monthly"
      ],
      popular: true,
      glow: "box-glow-lime border-electric-lime/40 scale-105 z-10 bg-electric-lime/5",
      accent: "text-electric-lime",
      iconColor: "text-electric-lime",
      btnStyle: "primary-btn py-4 w-full text-center shadow-[0_0_20px_rgba(223,255,17,0.3)]",
      planId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_HALFYEARLY
    },
    {
      name: "Yearly Immortal",
      defaultPrice: "₹11,999",
      period: "/year",
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
      btnStyle: "secondary-btn py-4 w-full text-center",
      planId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY
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
        <p className="text-white/60 text-base leading-relaxed mb-8">
          Select your training access protocol. Unlock advanced tracking, elite coaches, and premium facilities.
        </p>
        <button 
          onClick={() => document.getElementById('qr-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-deep-obsidian border border-electric-lime text-electric-lime font-sora text-sm font-bold tracking-widest uppercase hover:bg-electric-lime hover:text-deep-obsidian transition-all shadow-[0_0_15px_rgba(223,255,17,0.2)] hover:shadow-[0_0_25px_rgba(223,255,17,0.4)]"
        >
          <QrCode className="w-4 h-4" />
          QR Payment Available ↓
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-stretch mb-24">
        {plans.map((plan, i) => {
          const displayPrice = plan.planId && dynamicPrices[plan.planId] 
            ? dynamicPrices[plan.planId] 
            : plan.defaultPrice;

          return (
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
                {loadingPrices ? (
                  <div className="h-12 w-24 bg-white/10 animate-pulse rounded"></div>
                ) : (
                  <>
                    <span className={`text-5xl font-extrabold font-sora ${plan.accent}`}>{displayPrice}</span>
                    <span className="text-white/40 font-mono text-xs">{plan.period}</span>
                  </>
                )}
              </div>
              
              <ul className="flex-1 space-y-5 mb-10 text-left font-sans">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Check className={`w-5 h-5 shrink-0 ${plan.iconColor}`} />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <RazorpayCheckoutButton planId={plan.planId} className={plan.btnStyle}>
                INITIATE PLAN
              </RazorpayCheckoutButton>
            </motion.div>
          );
        })}
      </div>

      {/* QR Code Alternative Payment Section */}
      <motion.div 
        id="qr-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto glass-card border border-glass-stroke p-12 text-center relative overflow-hidden mt-12"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-electric-lime/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex items-center justify-center gap-3 mb-6">
          <QrCode className="w-8 h-8 text-electric-lime" />
          <h2 className="text-3xl font-extrabold font-sora text-white">ALTERNATIVE PAYMENT</h2>
        </div>
        
        <p className="text-white/60 text-sm mb-10 max-w-lg mx-auto">
          Prefer to pay directly? Scan the official Razorpay QR code below using any UPI app (GPay, PhonePe, Paytm). 
          Please send payment confirmation to administration to activate your plan manually.
        </p>

        <RazorpayQRCode />
      </motion.div>
    </div>
  );
}
