import { Button } from "@/components/ui/button"
import type { GameState, GamePhase } from "@/hooks/use-game-state"

interface GameStatusProps {
  gameState: GameState
  actionLog: string[]
  onNextPhase: () => void
  onResetGame: () => void
  position?: "left" | "right" | "top"
}

const phaseNames: Record<GamePhase, string> = {
  draw: "Draw Phase",
  play: "Play Phase",
  attack: "Attack Phase",
  end: "End Phase",
}

export function GameStatus({ gameState, actionLog, onNextPhase, onResetGame, position = "top" }: GameStatusProps) {
  const currentPlayerName = gameState.currentPlayer === "player1" ? "Player 1" : "Player 2"
  const isVertical = position === "left" || position === "right"

  if (position === "left") {
    return (
      <div className="space-y-4">
        {/* Game Info Panel */}
        <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
          <div className="relative z-10 p-4">
            <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-3">
              Game Status
            </h3>
            <div className="space-y-3">
              <div className="flex flex-col space-y-2">
                <span className="text-gray-300 text-sm">Turn:</span>
                <span className="font-bold text-white bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-2 rounded-lg text-center">
                  {gameState.turn}
                </span>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-gray-300 text-sm">Current Player:</span>
                <span className={`font-bold px-3 py-2 rounded-lg text-center ${
                  gameState.currentPlayer === "player1" 
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                }`}>
                  {currentPlayerName}
                </span>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-gray-300 text-sm">Phase:</span>
                <span className="font-bold text-white bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-2 rounded-lg text-center">
                  {phaseNames[gameState.currentPhase]}
                </span>
              </div>
              {gameState.gameOver && (
                <div className="mt-3 p-3 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/50 rounded-lg">
                  <div className="text-yellow-300 font-bold text-center animate-pulse">
                    🏆 {gameState.winner === "player1" ? "Player 1" : "Player 2"} Wins!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 animate-pulse"></div>
          <div className="relative z-10 p-4">
            <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-3">
              Controls
            </h3>
            <div className="space-y-3">
              <Button
                onClick={onNextPhase}
                disabled={gameState.gameOver}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Next Phase
              </Button>
              <Button 
                onClick={onResetGame} 
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-0 shadow-lg hover:shadow-gray-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Reset Game
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (position === "right") {
    return (
      <div className="space-y-4">
        {/* Player Stats Panel */}
        <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 animate-pulse"></div>
          <div className="relative z-10 p-4">
            <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
              Player Stats
            </h3>
            <div className="space-y-4">
              {/* Player 1 Stats */}
              <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-lg p-3">
                <div className="text-center mb-2">
                  <span className="font-semibold text-blue-300">Player 1</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-red-500/20 px-2 py-1 rounded text-sm">
                    <span>❤️ Health</span>
                    <span className="font-bold text-red-300">{gameState.player1Health}</span>
                  </div>
                  <div className="flex items-center justify-between bg-yellow-500/20 px-2 py-1 rounded text-sm">
                    <span>⭐ Score</span>
                    <span className="font-bold text-yellow-300">{gameState.player1Score}</span>
                  </div>
                  <div className="flex items-center justify-between bg-purple-500/20 px-2 py-1 rounded text-sm">
                    <span>🃏 Cards</span>
                    <span className="font-bold text-purple-300">{gameState.player1Hand.length}</span>
                  </div>
                </div>
              </div>

              {/* Player 2 Stats */}
              <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/30 rounded-lg p-3">
                <div className="text-center mb-2">
                  <span className="font-semibold text-red-300">Player 2</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-red-500/20 px-2 py-1 rounded text-sm">
                    <span>❤️ Health</span>
                    <span className="font-bold text-red-300">{gameState.player2Health}</span>
                  </div>
                  <div className="flex items-center justify-between bg-yellow-500/20 px-2 py-1 rounded text-sm">
                    <span>⭐ Score</span>
                    <span className="font-bold text-yellow-300">{gameState.player2Score}</span>
                  </div>
                  <div className="flex items-center justify-between bg-purple-500/20 px-2 py-1 rounded text-sm">
                    <span>🃏 Cards</span>
                    <span className="font-bold text-purple-300">{gameState.player2Hand.length}</span>
                  </div>
                </div>
              </div>

              {/* Deck Info */}
              <div className="bg-gradient-to-r from-gray-600/20 to-gray-700/20 border border-gray-500/30 rounded-lg p-3">
                <div className="text-center mb-2">
                  <span className="font-semibold text-gray-300">Deck</span>
                </div>
                <div className="flex items-center justify-center bg-gray-500/20 px-2 py-1 rounded text-sm">
                  <span>📚</span>
                  <span className="font-bold text-gray-300 ml-2">{gameState.deck.length} cards</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Log Panel */}
        <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 animate-pulse"></div>
          <div className="relative z-10 p-4">
            <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-3">
              Action Log
            </h3>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/30 rounded-lg p-3">
              <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                {actionLog.length === 0 ? (
                  <div className="text-gray-500 text-sm italic text-center">No actions yet...</div>
                ) : (
                  actionLog.map((log, index) => (
                    <div key={index} className="text-gray-300 text-xs bg-slate-700/30 px-2 py-1 rounded border-l-2 border-cyan-400/50">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Modern glass-morphism status panel */}
      <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
        
        <div className="relative z-10 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Info */}
            <div className="space-y-3">
              <h3 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Game Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">Turn:</span>
                  <span className="font-bold text-white bg-gradient-to-r from-amber-400 to-orange-400 px-2 py-1 rounded-lg text-sm">
                    {gameState.turn}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">Current Player:</span>
                  <span className={`font-bold px-3 py-1 rounded-lg text-sm ${
                    gameState.currentPlayer === "player1" 
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
                      : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  }`}>
                    {currentPlayerName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">Phase:</span>
                  <span className="font-bold text-white bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-1 rounded-lg text-sm">
                    {phaseNames[gameState.currentPhase]}
                  </span>
                </div>
                {gameState.gameOver && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/50 rounded-lg">
                    <div className="text-yellow-300 font-bold text-lg animate-pulse">
                      🏆 Game Over! {gameState.winner === "player1" ? "Player 1" : "Player 2"} Wins!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Player Stats */}
            <div className="space-y-3">
              <h3 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                Player Stats
              </h3>
              <div className="space-y-3">
                {/* Player 1 Stats */}
                <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-300">Player 1:</span>
                    <div className="flex space-x-3">
                      <span className="flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded text-sm">
                        <span>❤️</span>
                        <span className="font-bold text-red-300">{gameState.player1Health}</span>
                      </span>
                      <span className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded text-sm">
                        <span>⭐</span>
                        <span className="font-bold text-yellow-300">{gameState.player1Score}</span>
                      </span>
                      <span className="flex items-center space-x-1 bg-purple-500/20 px-2 py-1 rounded text-sm">
                        <span>🃏</span>
                        <span className="font-bold text-purple-300">{gameState.player1Hand.length}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Player 2 Stats */}
                <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-red-300">Player 2:</span>
                    <div className="flex space-x-3">
                      <span className="flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded text-sm">
                        <span>❤️</span>
                        <span className="font-bold text-red-300">{gameState.player2Health}</span>
                      </span>
                      <span className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded text-sm">
                        <span>⭐</span>
                        <span className="font-bold text-yellow-300">{gameState.player2Score}</span>
                      </span>
                      <span className="flex items-center space-x-1 bg-purple-500/20 px-2 py-1 rounded text-sm">
                        <span>🃏</span>
                        <span className="font-bold text-purple-300">{gameState.player2Hand.length}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deck Info */}
                <div className="bg-gradient-to-r from-gray-600/20 to-gray-700/20 border border-gray-500/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-300">Deck:</span>
                    <span className="flex items-center space-x-1 bg-gray-500/20 px-2 py-1 rounded text-sm">
                      <span>📚</span>
                      <span className="font-bold text-gray-300">{gameState.deck.length} cards remaining</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls & Log */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  size="sm"
                  onClick={onNextPhase}
                  disabled={gameState.gameOver}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Next Phase
                </Button>
                <Button 
                  size="sm" 
                  onClick={onResetGame} 
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-0 shadow-lg hover:shadow-gray-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Reset Game
                </Button>
              </div>
              
              {/* Action Log */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/30 rounded-lg p-3">
                <div className="font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Action Log:
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
                  {actionLog.length === 0 ? (
                    <div className="text-gray-500 text-sm italic">No actions yet...</div>
                  ) : (
                    actionLog.map((log, index) => (
                      <div key={index} className="text-gray-300 text-sm bg-slate-700/30 px-2 py-1 rounded border-l-2 border-cyan-400/50">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
