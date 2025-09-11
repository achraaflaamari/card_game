"use client"

import type React from "react"

import { useState } from "react"
import { GameCard, type GameCardProps } from "./game-card"
import { CardSlot } from "./card-slot"
import { GameStatus } from "./game-status"
import { useGameState } from "@/hooks/use-game-state"

// Sample game data
const initialPlayerHand: GameCardProps[] = [
  { type: "database", value: 5 },
  { type: "firewall", value: 3 },
  { type: "scanner", value: 4 },
  { type: "shield", value: 2 },
  { type: "attack", value: 6 },
]

const playerCards: GameCardProps[] = [{ type: "player" }, { type: "player" }, { type: "player" }, { type: "player" }]

const initialPlayer1Board = [
  { type: "firewall" as const, value: 5 },
  { type: "database" as const, value: 5 },
  { type: "scanner" as const, value: 5 },
  { type: "shield" as const, value: 5 },
]

const initialPlayer2Board = [
  { type: "scanner" as const, value: 5 },
  null,
  { type: "attack" as const, value: 5 },
  { type: "database" as const, value: 5 },
]

export function GameBoard() {
  const { gameState, actionLog, nextPhase, playCard, resetGame, damageSPV, restoreSPV, isInitialized } = useGameState()
  const [selectedCard, setSelectedCard] = useState<GameCardProps | null>(null)
  const [draggedCard, setDraggedCard] = useState<GameCardProps | null>(null)
  const [validDropZones, setValidDropZones] = useState<number[]>([])
  const [targetingMode, setTargetingMode] = useState<{card: GameCardProps, player?: string} | null>(null)

  const [player1Board, setPlayer1Board] = useState<(GameCardProps | null)[]>(initialPlayer1Board)
  const [player2Board, setPlayer2Board] = useState<(GameCardProps | null)[]>(initialPlayer2Board)

  // Get current player's hand from game state
  const currentPlayerHand = gameState.currentPlayer === "player1" ? gameState.player1Hand : gameState.player2Hand

  // Show loading state while deck is being initialized
  if (!isInitialized) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Shuffling deck and dealing cards...</p>
        </div>
      </div>
    )
  }

  const handleDragStart =
    (card: GameCardProps, fromHand = false) =>
    (e: React.DragEvent) => {
      if (gameState.currentPhase !== "play" || gameState.gameOver) {
        e.preventDefault()
        return
      }

      setDraggedCard(card)
      e.dataTransfer.setData("application/json", JSON.stringify({ ...card, fromHand }))

      // Show valid drop zones (empty slots in player 1 board for now)
      if (fromHand) {
        const emptySlots = player1Board.map((slot, index) => (slot === null ? index : -1)).filter((i) => i !== -1)
        setValidDropZones(emptySlots)
      }
    }

  const handleDragEnd = () => {
    setDraggedCard(null)
    setValidDropZones([])
  }

  const handleCardDrop =
    (slotIndex: number, isPlayer2 = false) =>
    (droppedCard: GameCardProps & { fromHand?: boolean }) => {
      if (gameState.currentPhase !== "play" || gameState.gameOver) {
        return
      }

      if (droppedCard.fromHand) {
        // Place card on board (hand removal is handled by playCard function)
        if (isPlayer2) {
          setPlayer2Board((prev) => {
            const newBoard = [...prev]
            newBoard[slotIndex] = { type: droppedCard.type, value: droppedCard.value }
            return newBoard
          })
        } else {
          setPlayer1Board((prev) => {
            const newBoard = [...prev]
            newBoard[slotIndex] = { type: droppedCard.type, value: droppedCard.value }
            return newBoard
          })
        }

        playCard(droppedCard)
      }
    }

  const handleCardClick = (card: GameCardProps) => {
    if (gameState.gameOver) return
    
    // If card requires targeting (attack or shield), enter targeting mode
    if (card.type === "attack" || card.type === "shield") {
      setTargetingMode({ card })
      setSelectedCard(card)
    } else {
      // For cards that don't need targeting, play immediately
      playCard(card)
      setSelectedCard(null)
    }
  }

  const handleSPVClick = (player: "player1" | "player2", slotIndex: number) => {
    if (gameState.gameOver) return
    
    if (targetingMode) {
      // Play the targeted card
      if (targetingMode.card.type === "attack") {
        playCard(targetingMode.card, player, slotIndex)
      } else if (targetingMode.card.type === "shield") {
        playCard(targetingMode.card, player, slotIndex)
      }
      setTargetingMode(null)
      setSelectedCard(null)
    } else {
      // Direct SPV interaction for testing
      if (player === "player1") {
        restoreSPV("player1", slotIndex, 1)
      } else {
        damageSPV("player2", slotIndex, 1)
      }
    }
  }

  const handleResetGame = () => {
    resetGame()
    setPlayer1Board(initialPlayer1Board)
    setPlayer2Board(initialPlayer2Board)
    setSelectedCard(null)
  }

  return (
    <div className="w-full max-w-8xl mx-auto">
      {/* Main Layout with Side Status Bars */}
      <div className="flex gap-4 items-start">
        {/* Left Status Panel */}
        <div className="w-60 flex-shrink-0">
          <GameStatus 
            gameState={gameState} 
            actionLog={actionLog} 
            onNextPhase={nextPhase} 
            onResetGame={handleResetGame}
            position="left"
          />
        </div>

        {/* 3D Game Board Container */}
        <div className="flex-1 relative perspective-[1000px]">
        {/* Main 3D Game Board */}
        <div className="relative bg-gradient-to-b from-amber-100/90 via-yellow-50/90 to-amber-200/90 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-amber-300/50 transform-gpu preserve-3d" 
             style={{ transform: 'rotateX(25deg) ' }}>
          
          {/* Board Inner Shadow */}
          <div className="absolute inset-4 bg-gradient-to-br from-amber-50/50 to-yellow-100/50 rounded-2xl shadow-inner"></div>
          
          {/* Game Board Layout */}
          <div className="relative z-10 p-8">
            
            {/* Top Player Area (Player 1) */}
            <div className="mb-8">
              <div className="bg-gradient-to-b from-blue-100/80 to-blue-200/80 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-300/50 shadow-lg">
                <h3 className="text-sm font-bold mb-3 text-center text-blue-800">
                  Player 1 Area
                  {gameState.currentPlayer === "player1" && <span className="ml-2 text-green-600 font-bold">(Active)</span>}
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {player1Board.slice(0, 4).map((card, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      {/* SPV Health Indicator */}
                      <div 
                        className={`transform scale-75 cursor-pointer hover:scale-80 transition-transform ${
                          targetingMode ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''
                        }`}
                        onClick={() => handleSPVClick("player1", index)}
                        title={targetingMode 
                          ? `Target Player 1 Server ${index + 1} with ${targetingMode.card.type}` 
                          : `Player 1 Server ${index + 1} - SPV: ${gameState.player1SPV[index]}/5 (Click to heal)`}
                      >
                        <GameCard type="shield" value={gameState.player1SPV[index]} />
                        <div className={`absolute inset-0 rounded-lg backdrop-blur-sm ${
                          gameState.player1SPV[index] > 3 ? 'bg-gradient-to-br from-green-600/70 to-green-700/70' :
                          gameState.player1SPV[index] > 1 ? 'bg-gradient-to-br from-yellow-600/70 to-orange-600/70' :
                          gameState.player1SPV[index] > 0 ? 'bg-gradient-to-br from-red-600/70 to-red-700/70' :
                          'bg-gradient-to-br from-gray-600/70 to-gray-800/70'
                        }`}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-xs drop-shadow-lg">
                            SPV {gameState.player1SPV[index]}
                          </span>
                        </div>
                      </div>
                      {/* Card Slot */}
                      <CardSlot
                        card={card || undefined}
                        isEmpty={!card}
                        isValidDropTarget={validDropZones.includes(index)}
                        onDrop={handleCardDrop(index, false)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Area - Deck and Special Cards */}
            <div className="flex justify-center items-center mb-8 py-6">
              <div className="flex items-center space-x-8">
                {/* Left Deck */}
                <div className="relative transform hover:scale-105 transition-transform">
                  <GameCard type="attack" value={0} />
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-lg backdrop-blur-sm"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm drop-shadow-lg">DECK</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                    {gameState.deck.length}
                  </div>
                </div>

                {/* Central Special Card */}
                <div className="transform scale-110 hover:scale-125 transition-transform">
                  <GameCard type="scanner" />
                </div>

                {/* Right Deck/Graveyard */}
                <div className="relative transform hover:scale-105 transition-transform">
                  <GameCard type="shield" value={0} />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-800/70 to-purple-900/70 rounded-lg backdrop-blur-sm"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xs drop-shadow-lg">GRAVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Player Area (Player 2) */}
            <div>
              <div className="bg-gradient-to-t from-red-100/80 to-red-200/80 backdrop-blur-sm rounded-xl p-4 border-2 border-red-300/50 shadow-lg">
                <h3 className="text-sm font-bold mb-3 text-center text-red-800">
                  Player 2 Area
                  {gameState.currentPlayer === "player2" && <span className="ml-2 text-blue-600 font-bold">(Active)</span>}
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {player2Board.slice(0, 4).map((card, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      {/* Card Slot */}
                      <CardSlot
                        card={card || undefined}
                        isEmpty={!card}
                        onDrop={handleCardDrop(index, true)}
                      />
                      {/* SPV Health Indicator */}
                      <div 
                        className={`transform scale-75 cursor-pointer hover:scale-80 transition-transform ${
                          targetingMode ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''
                        }`}
                        onClick={() => handleSPVClick("player2", index)}
                        title={targetingMode 
                          ? `Target Player 2 Server ${index + 1} with ${targetingMode.card.type}` 
                          : `Player 2 Server ${index + 1} - SPV: ${gameState.player2SPV[index]}/5 (Click to damage)`}
                      >
                        <GameCard type="shield" value={gameState.player2SPV[index]} />
                        <div className={`absolute inset-0 rounded-lg backdrop-blur-sm ${
                          gameState.player2SPV[index] > 3 ? 'bg-gradient-to-br from-green-600/70 to-green-700/70' :
                          gameState.player2SPV[index] > 1 ? 'bg-gradient-to-br from-yellow-600/70 to-orange-600/70' :
                          gameState.player2SPV[index] > 0 ? 'bg-gradient-to-br from-red-600/70 to-red-700/70' :
                          'bg-gradient-to-br from-gray-600/70 to-gray-800/70'
                        }`}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-xs drop-shadow-lg">
                            SPV {gameState.player2SPV[index]}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

            {/* Player Hand - Below Player 1 Area */}
            <div className="mt-6 flex justify-center">
              <div className="bg-gradient-to-t from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl p-4 border border-gray-600/50 shadow-2xl">
                <h3 className="text-lg font-bold mb-3 text-center text-white">
                  Your Hand
                  <span className="ml-4 text-sm text-gray-300 font-normal">
                    {targetingMode 
                      ? `Targeting with ${targetingMode.card.type} - Click a server to target`
                      : gameState.currentPhase === "play" && !gameState.gameOver
                        ? "Click cards to play them"
                        : gameState.gameOver
                          ? "Game Over"
                          : `Current Phase: ${gameState.currentPhase}`}
                  </span>
                  {targetingMode && (
                    <button 
                      className="ml-4 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                      onClick={() => {
                        setTargetingMode(null)
                        setSelectedCard(null)
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </h3>
                <div className="flex justify-center space-x-2">
                  {currentPlayerHand.map((card: GameCardProps, index: number) => (
                    <div key={index} className="transform hover:-translate-y-2 transition-transform">
                      <GameCard
                        {...card}
                        isActive={selectedCard === card}
                        isDragging={draggedCard === card}
                        onClick={() => handleCardClick(card)}
                        onDragStart={handleDragStart(card, true)}
                        onDragEnd={handleDragEnd}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </div>

        {/* Right Status Panel */}
        <div className="w-60 flex-shrink-0">
          <GameStatus 
            gameState={gameState} 
            actionLog={actionLog} 
            onNextPhase={nextPhase} 
            onResetGame={handleResetGame}
            position="right"
          />
        </div>
      </div>
    </div>
  )
}
