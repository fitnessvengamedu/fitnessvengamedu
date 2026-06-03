import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import SmoothScroll from "@/components/SmoothScroll";
import TopNavBar from "@/components/TopNavBar";

const sora = Sora({ 
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "700", "800"]
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500"]
});

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || "Fitness Gym"} | Engineered for Performance`,
  description: "Experience a new dimension of human performance. We merge elite kinetic coaching with biometric data streams.",
};

import { createClient } from '@/utils/supabase/server';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark">
      <body className={`${sora.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col bg-deep-obsidian text-foreground antialiased`}>
        <SmoothScroll>
          {/* TopNavBar */}
          <TopNavBar appName={process.env.NEXT_PUBLIC_APP_NAME || "Fitness Gym"} user={user} />

          {/* Main Content */}
          <main className="flex-1 pt-20">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-deep-obsidian border-t border-glass-stroke w-full py-16">
            <div className="flex flex-col lg:flex-row justify-between items-start px-4 md:px-12 gap-12 w-full max-w-7xl mx-auto">
              
              {/* Brand & Address */}
              <div className="flex flex-col items-center md:items-start gap-4 flex-1">
                <div className="text-3xl font-bold tracking-tighter text-white font-sora">
                  <span className="text-electric-lime uppercase animate-brand-pulse inline-block">{process.env.NEXT_PUBLIC_APP_NAME || "Fitness Gym"}</span>
                </div>
                <div className="text-white/60 font-mono text-xs leading-relaxed max-w-sm text-center md:text-left">
                  <p className="mb-2 font-bold text-white/80">COMMAND CENTER</p>
                  <p>{process.env.NEXT_PUBLIC_GYM_ADDRESS}</p>
                  <p className="mt-2 text-electric-lime/80 hover:text-electric-lime transition-colors">
                    <a href={`mailto:${process.env.NEXT_PUBLIC_GYM_EMAIL}`}>{process.env.NEXT_PUBLIC_GYM_EMAIL}</a>
                  </p>
                  <p className="text-electric-lime/80 hover:text-electric-lime transition-colors">
                    <a href={`tel:${process.env.NEXT_PUBLIC_GYM_PHONE}`}>{process.env.NEXT_PUBLIC_GYM_PHONE}</a>
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="flex flex-col items-center md:items-start gap-4 flex-1">
                <p className="font-bold text-white/80 font-mono text-xs uppercase tracking-widest border-b border-glass-stroke pb-2 w-full md:w-auto">Protocols</p>
                <div className="flex flex-col gap-3 font-mono text-[11px] uppercase tracking-widest text-center md:text-left">
                  <Link href="#" className="text-white/40 hover:text-electric-lime transition-all">Privacy Protocol</Link>
                  <Link href="#" className="text-white/40 hover:text-electric-lime transition-all">Terms of Service</Link>
                  <Link href="#" className="text-white/40 hover:text-electric-lime transition-all">Telemetry Support</Link>
                  <Link href="/feedback" className="text-white/40 hover:text-electric-lime transition-all">Submit Feedback</Link>
                </div>
              </div>

              {/* Map Embed */}
              <div className="w-full lg:w-[400px] h-[200px] rounded-xl overflow-hidden border border-glass-stroke bg-white/5">
                {process.env.NEXT_PUBLIC_GYM_MAP_EMBED ? (
                  <iframe 
                    src={process.env.NEXT_PUBLIC_GYM_MAP_EMBED} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 font-mono text-xs uppercase text-center p-4">
                    Map Data Offline.<br/>Configure NEXT_PUBLIC_GYM_MAP_EMBED
                  </div>
                )}
              </div>
            </div>

            <div className="w-full max-w-7xl mx-auto px-4 md:px-12 mt-12 pt-8 border-t border-glass-stroke">
              <p className="text-white/30 text-center font-mono text-[10px] uppercase tracking-widest">
                © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME || "Fitness Gym"}. ENGINEERED FOR PERFORMANCE.
              </p>
            </div>
          </footer>
        </SmoothScroll>
      </body>
    </html>
  );
}
