import { GameBoard } from "@/components/game-board";
import { Geist, Geist_Mono } from "next/font/google";

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
    <main className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-100 p-4`}>
      <div className="max-w-7xl mx-auto">
        <GameBoard />
      </div>
    </main>
  );
}