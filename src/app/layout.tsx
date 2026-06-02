import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stitch Apex Elite | Fitness Gym",
  description: "Join the best fitness gym to achieve your goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
        <SmoothScroll>
          {/* Navigation */}
          <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/50 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors duration-300 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-glow-blue">Stitch Apex Elite</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                <Link href="/" className="text-white/70 hover:text-white hover:text-glow-blue transition-all duration-300">Home</Link>
                <Link href="/about" className="text-white/70 hover:text-white hover:text-glow-blue transition-all duration-300">About</Link>
                <Link href="/gallery" className="text-white/70 hover:text-white hover:text-glow-blue transition-all duration-300">Gallery</Link>
                <Link href="/services" className="text-white/70 hover:text-white hover:text-glow-blue transition-all duration-300">Services</Link>
              </nav>

              <div className="flex items-center gap-4">
                <Link href="/signin" className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-300">
                  Sign In
                </Link>
                <Link href="/signup" className="primary-button text-sm px-5 py-2 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]">
                  Join Now
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-white/10 bg-black/40 py-12">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="font-bold text-lg text-glow-blue">Stitch Apex Elite</span>
              </div>
              <p className="text-sm text-white/40">
                © {new Date().getFullYear()} Stitch Apex Elite. All rights reserved. Developed with futuristic aesthetics.
              </p>
            </div>
          </footer>
        </SmoothScroll>
      </body>
    </html>
  );
}
