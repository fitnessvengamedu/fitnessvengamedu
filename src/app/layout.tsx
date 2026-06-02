import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import SmoothScroll from "@/components/SmoothScroll";

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
  title: "STITCH APEX ELITE | Engineered for Performance",
  description: "Experience a new dimension of human performance. We merge elite kinetic coaching with biometric data streams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${sora.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col bg-deep-obsidian text-foreground antialiased`}>
        <SmoothScroll>
          {/* TopNavBar */}
          <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-xl border-b border-glass-stroke shadow-[0_0_20px_rgba(223,255,17,0.03)] z-50">
            <div className="flex justify-between items-center px-4 md:px-12 h-20 w-full max-w-7xl mx-auto">
              <Link href="/" className="font-extrabold text-lg md:text-2xl tracking-tighter text-white font-sora">
                STITCH <span className="text-electric-lime text-glow">APEX ELITE</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest">
                <Link href="/" className="text-electric-lime border-b border-electric-lime pb-1">Training</Link>
                <Link href="/about" className="text-white/60 hover:text-electric-lime transition-all duration-300">Facility</Link>
                <Link href="/services" className="text-white/60 hover:text-electric-lime transition-all duration-300">Elite Plans</Link>
                <Link href="/gallery" className="text-white/60 hover:text-electric-lime transition-all duration-300">Gallery</Link>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/signin" className="hidden lg:block text-white/60 hover:text-electric-lime transition-colors font-mono text-xs uppercase tracking-widest">
                  Member Login
                </Link>
                <Link href="/signup" className="primary-btn">
                  Join Elite
                </Link>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 pt-20">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-deep-obsidian border-t border-glass-stroke w-full py-12">
            <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-12 gap-8 w-full max-w-7xl mx-auto">
              <div className="flex flex-col items-center md:items-start gap-3">
                <div className="text-2xl font-bold tracking-tighter text-white font-sora">
                  STITCH <span className="text-electric-lime">APEX ELITE</span>
                </div>
                <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">
                  © {new Date().getFullYear()} STITCH APEX ELITE. ENGINEERED FOR PERFORMANCE.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px] uppercase tracking-widest">
                <Link href="#" className="text-white/40 hover:text-electric-lime transition-all">Privacy Protocol</Link>
                <Link href="#" className="text-white/40 hover:text-electric-lime transition-all">Terms of Service</Link>
                <Link href="#" className="text-white/40 hover:text-electric-lime transition-all">Telemetry Support</Link>
                <Link href="#" className="text-white/40 hover:text-electric-lime transition-all">Contact Command</Link>
              </div>
            </div>
          </footer>
        </SmoothScroll>
      </body>
    </html>
  );
}
