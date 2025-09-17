import { GameBoard } from "@/components/game-board";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image"; // Import Next.js Image component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main className={`${geistSans.variable} ${geistMono.variable} min-h-screen relative overflow-y-auto no-scrollbar w-full `}>
      {/* Background with image instead of gradient */}
      <div className="fixed inset-0 w-full h-full">
        {/* Background image */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <Image
            src="/Abstract_img.jpg" // Replace with your image path
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay to ensure content remains readable */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20 z-1">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3)_0%,transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2)_0%,transparent_50%)]"></div>
        </div>
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-10 z-1">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-white/30 rotate-45 rounded-lg"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 border border-white/20 rotate-12 rounded-lg"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] border border-white/15 rotate-6 rounded-2xl"></div>
        </div>
      </div>

      {/* Main game content */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <GameBoard />
        </div>
      </div>
    </main>
  );
}