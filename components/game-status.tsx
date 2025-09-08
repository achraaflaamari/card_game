import { Button } from "@/components/ui/button"
import type { GameState, GamePhase } from "@/hooks/use-game-state"

interface GameStatusProps {
  gameState: GameState
  actionLog: string[]
  onNextPhase: () => void
  onResetGame: () => void
}

const phaseNames: Record<GamePhase, string> = {
  draw: "Draw Phase",
  play: "Play Phase",
  attack: "Attack Phase",
  end: "End Phase",
}

export function GameStatus({ gameState, actionLog, onNextPhase, onResetGame }: GameStatusProps) {
  const currentPlayerName = gameState.currentPlayer === "player1" ? "Player 1" : "Player 2"

  return (
    <div className="bg-slate-800 text-white p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Game Info */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Game Status</h3>
          <div className="text-sm space-y-1">
            <div>Turn: {gameState.turn}</div>
            <div>Current Player: {currentPlayerName}</div>
            <div>Phase: {phaseNames[gameState.currentPhase]}</div>
            {gameState.gameOver && (
              <div className="text-yellow-400 font-bold">
                Game Over! {gameState.winner === "player1" ? "Player 1" : "Player 2"} Wins!
              </div>
            )}
          </div>
        </div>

        {/* Player Stats */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Player Stats</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Player 1:</span>
              <span>
                ❤️ {gameState.player1Health} | ⭐ {gameState.player1Score}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Player 2:</span>
              <span>
                ❤️ {gameState.player2Health} | ⭐ {gameState.player2Score}
              </span>
            </div>
          </div>
        </div>

        {/* Controls & Log */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onNextPhase}
              disabled={gameState.gameOver}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next Phase
            </Button>
            <Button size="sm" onClick={onResetGame} variant="outline" className="text-black bg-transparent">
              Reset Game
            </Button>
          </div>
          <div className="text-xs">
            <div className="font-semibold mb-1">Action Log:</div>
            <div className="space-y-1 max-h-16 overflow-y-auto">
              {actionLog.map((log, index) => (
                <div key={index} className="text-gray-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
