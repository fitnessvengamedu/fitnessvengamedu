"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, useScroll } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const heroImgRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [10, -10]);
  const rotateY = useTransform(x, [0, 1], [-10, 10]);

  const springX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const { scrollY } = useScroll();
  const parallaxBgY = useTransform(scrollY, [0, 1000], [0, 150]);
  const parallaxHeroImgY = useTransform(scrollY, [0, 1000], [0, -60]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!heroImgRef.current) return;
    const rect = heroImgRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div className="flex flex-col items-center w-full bg-deep-obsidian min-h-screen relative overflow-hidden">
      
      {/* Noise and Scanline overlay */}
      <div className="noise-overlay pointer-events-none absolute inset-0 z-10" />

      {/* Hero Section */}
      <section className="relative w-full min-h-[95vh] flex items-center justify-center overflow-hidden px-4 md:px-12 py-20">
        <div className="scanline" />
        
        {/* Cinematic Background Image with Scroll Parallax */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img 
            style={{ y: parallaxBgY }}
            alt="Hero Background" 
            className="w-full h-[120%] object-cover opacity-35 scale-105 absolute top-0" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5YEtLphCg7bRg8kf5JholoqvUY9gyIWJMjOAPcS4iwf4lldo62DEkUL6XLo1Pw0KRucPm_b0d6Gx-XIoJJ9RS6NdIcW4ohIIPWu1d9ET_ru53dXb3C8KhssgPhblv-bcurjNuqlj5lWSePl9pO8DbOF2OBQGD0e-Wf7auyolvE1sCbbu9hQOsFCp8_ayav2xsEwmEzm_ZoAtloGd5YgjvGM3cr3EvF5BK-Ki_gyqkliO14_YDR9lYvV53ndn9H6_4zKP9zx6Yiuc"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-obsidian via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep-obsidian/85 via-transparent to-transparent z-10" />
        </div>

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

          {/* Dumbbell Photo Showcase Frame with 3D Tilt Effect */}
          <div className="perspective-1000 flex items-center justify-center w-full">
            <motion.div
              ref={heroImgRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX: springX,
                rotateY: springY,
                transformStyle: "preserve-3d",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full max-w-[500px] aspect-[4/3] rounded-2xl border border-glass-stroke glass-card p-4 overflow-hidden group cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            >
              {/* Scanline and Glow */}
              <div className="scanline" />
              <div className="absolute inset-0 bg-gradient-to-tr from-electric-lime/10 via-transparent to-apex-crimson/10 opacity-60 z-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-80" />
              
              {/* Image with Parallax & Hover scale */}
              <div className="w-full h-full overflow-hidden rounded-xl relative">
                <motion.img 
                  style={{ y: parallaxHeroImgY }}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 z-0" 
                  src="/images/gym_2.jpg"
                  alt="Apex Heavy Dumbbell"
                />
              </div>

              {/* High-tech telemetry overlay */}
              <div className="absolute bottom-6 left-6 right-6 z-20 bg-deep-obsidian/75 backdrop-blur-md p-4 rounded-xl border border-glass-stroke space-y-2 transform translate-z-20">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] text-electric-lime uppercase tracking-widest font-bold">
                    SYSTEM: ONLINE
                  </span>
                  <span className="font-mono text-[9px] text-white/40">
                    CALIBRATION: ACTIVE
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white font-sora tracking-tight">
                  KINETIC SYSTEM INITIALIZED
                </h4>
                <div className="h-[2px] bg-electric-lime/20 rounded-full overflow-hidden">
                  <div className="h-full bg-electric-lime w-4/5 animate-pulse" />
                </div>
                <div className="flex justify-between text-[9px] text-white/40 font-mono">
                  <span>LOAD: 30 KG</span>
                  <span>ACCURACY: 99.8%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Equipment Showcase Section */}
      <section className="w-full py-24 bg-surface/30 px-4 md:px-12 border-t border-b border-glass-stroke">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[350px] md:h-[450px] glass-card rounded-2xl border border-glass-stroke flex items-center justify-center overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.6)] cursor-pointer"
          >
            <div className="absolute inset-0 bg-electric-lime/5 rounded-full blur-[100px]" />
            <img 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 z-0" 
              src="/images/gym_1.jpg"
              alt="Apex Training Gear"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-obsidian via-deep-obsidian/30 to-transparent z-10" />
            
            {/* Live Camera feed box overlay */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-deep-obsidian/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-glass-stroke">
              <span className="w-2 h-2 rounded-full bg-electric-lime animate-ping" />
              <span className="font-mono text-[9px] text-white uppercase tracking-wider">LIVE FEED: CAM-01</span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-20 bg-deep-obsidian/75 backdrop-blur-md p-4 rounded-xl border border-glass-stroke">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[8px] text-electric-lime tracking-widest font-bold">DEVICE SYNCED</span>
                <span className="font-mono text-[8px] text-white/40">100% SIGNAL</span>
              </div>
              <p className="text-xs font-mono text-white/80">KETTLEBELLS / HEX DUMBBELLS / GRIP TECH</p>
            </div>
          </motion.div>

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
              className="md:col-span-8 group relative h-[500px] overflow-hidden rounded-xl border border-glass-stroke glass-card flex flex-col justify-end p-8 md:p-10"
            >
              <img 
                className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-110 transition-transform duration-1000 z-0" 
                src="/images/gym_1.jpg"
                alt="Kinetic Revolution"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-obsidian via-deep-obsidian/40 to-transparent z-10" />
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
              className="md:col-span-4 group relative h-[500px] overflow-hidden rounded-xl border border-glass-stroke glass-card flex flex-col justify-end p-8 md:p-10"
            >
              <img 
                className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-110 transition-transform duration-1000 z-0" 
                src="/images/gym_2.jpg"
                alt="Biometric Mastery"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-obsidian via-deep-obsidian/40 to-transparent z-10" />
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
              className="md:col-span-12 group relative h-[400px] overflow-hidden rounded-xl border border-glass-stroke glass-card flex items-center p-8 md:p-12"
            >
              <img 
                className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-1000 z-0" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIAJ1haPxAK0dM-B4mgX4lNEfriFcvM-UNIuNiqfLGKvYlUXs_IBZSwn9cFh2r2AUwukuxRwcgACQrLV4OA1rXU8wy7rIp3GqGhLxiZhOu0EeGb8P1Atg2xtnKQ3POB7ij7JKojBa9noaXqVq5I4ubSUp6oEiNjecSbpawpxtbsEi_qQOkoJ1t1_cdYKhucc0Q1X-wFvQimhBV3z02iHKJUOHsjr0Dn9SO6wChM7_QrvTgXA2hyzO7MqOi6MC1g05HpVNfEmg9FZ0"
                alt="Neural Reset"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-deep-obsidian via-transparent to-transparent z-10" />
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
      <section className="relative w-full py-24 bg-surface px-4 md:px-12 border-t border-glass-stroke overflow-hidden">
        
        {/* Background telemetry data stream from template */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAims_Kusqdsg9IcJLoksmx1cOV_1RSHoQp1tm5xTd-rtqgq8CsA6S0Bo0pAdwCmbNKKf5aV-KTZUyLBleEDyChgDOU57t-Dm67h9MPKfKEnC-xGRZd90mhmNLwVr60EeCiwQUahdvKI0FQ4WbkEGrT6fOikBCZUjk0onlHB4fzsYhthhVqodi1d22eRc7PkWCPM3SxzNJemQxqxvEYQ_Lk8YFO7aMmv7fulmto3KSXGVSHJIA6_h_C_RHzausViJ1Wz12Iw90wKUw"
            alt="Telemetry Data Background"
          />
          <div className="absolute inset-0 bg-deep-obsidian/85 backdrop-blur-sm" />
        </div>

        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10 relative">
          
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
