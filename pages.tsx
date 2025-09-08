import { GameBoard } from "@/components/game-board"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-slate-800"> Card Game</h1>
        <GameBoard />
      </div>
    </main>
  )
}
