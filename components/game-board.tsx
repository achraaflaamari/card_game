"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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

// Main layer - non-defense cards only
const initialPlayer1Board = [
  null, // firewall moved to defense layer
  { type: "database" as const, value: 5 },
  { type: "scanner" as const, value: 5 },
  null, // shield moved to defense layer
]

const initialPlayer2Board = [
  { type: "scanner" as const, value: 5 },
  null,
  { type: "attack" as const, value: 5 },
  { type: "database" as const, value: 5 },
]

// Defense layer - shield and firewall cards only
const initialPlayer1DefenseLayer = [
  { type: "firewall" as const, value: 5 }, // moved from main board
  null,
  null,
  { type: "shield" as const, value: 5 }, // moved from main board
]

const initialPlayer2DefenseLayer = [
  null,
  null,
  null,
  null,
]

export function GameBoard() {
  const { gameState, actionLog, endTurn, playCard, resetGame, damageSPV, restoreSPV, isInitialized, drawCard, addCardToHand } = useGameState()
  const [selectedCard, setSelectedCard] = useState<GameCardProps | null>(null)
  const [draggedCard, setDraggedCard] = useState<GameCardProps | null>(null)
  const [validDropZones, setValidDropZones] = useState<number[]>([])
  const [targetingMode, setTargetingMode] = useState<{card: GameCardProps, player?: string} | null>(null)

  const [player1Board, setPlayer1Board] = useState<(GameCardProps | null)[]>(initialPlayer1Board)
  const [player2Board, setPlayer2Board] = useState<(GameCardProps | null)[]>(initialPlayer2Board)
  
  // Defense layers - separate layer for defense cards only
  const [player1DefenseLayer, setPlayer1DefenseLayer] = useState<(GameCardProps | null)[]>(initialPlayer1DefenseLayer)
  const [player2DefenseLayer, setPlayer2DefenseLayer] = useState<(GameCardProps | null)[]>(initialPlayer2DefenseLayer)

  // Refs for player areas
  const player1AreaRef = useRef<HTMLDivElement>(null)
  const player2AreaRef = useRef<HTMLDivElement>(null)
  const lastActivePlayerRef = useRef<string>(gameState.currentPlayer)

  // Get current player's hand from game state
  const currentPlayerHand = gameState.currentPlayer === "player1" ? gameState.player1Hand : gameState.player2Hand

  // Auto-scroll to active player area
  useEffect(() => {
    if (gameState.currentPlayer !== lastActivePlayerRef.current) {
      lastActivePlayerRef.current = gameState.currentPlayer
      
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (gameState.currentPlayer === "player1" && player1AreaRef.current) {
          player1AreaRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          })
        } else if (gameState.currentPlayer === "player2" && player2AreaRef.current) {
          player2AreaRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          })
        }
      }, 100)
    }
  }, [gameState.currentPlayer])

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
      if (gameState.movesRemaining <= 0 || gameState.gameOver) {
        e.preventDefault()
        return
      }

      setDraggedCard(card)
      e.dataTransfer.setData("application/json", JSON.stringify({ ...card, fromHand }))

      // No visual recommendations when dragging from hand
    }

  const handleDragEnd = () => {
    setDraggedCard(null)
    setValidDropZones([])
  }

  const handleCardDrop =
    (slotIndex: number, isPlayer2 = false, isDefenseLayer = false) =>
    (droppedCard: GameCardProps & { fromHand?: boolean }) => {
      if (gameState.movesRemaining <= 0 || gameState.gameOver) {
        return
      }

      if (droppedCard.fromHand) {
        // Check if player is trying to place card in their own zone
        const isCurrentPlayerZone = (gameState.currentPlayer === "player2" && isPlayer2) || 
                                   (gameState.currentPlayer === "player1" && !isPlayer2)
        
        if (!isCurrentPlayerZone) {
          // Prevent placing card in opponent's zone
          return
        }

        // Determine if this is a defense card (shield or firewall)
        const isDefenseCard = droppedCard.type === "shield" || droppedCard.type === "firewall"
        
        // Validate card placement - defense cards only in defense layer, others only in main layer
        if (isDefenseLayer && !isDefenseCard) {
          // Non-defense card dropped on defense layer - reject
          return
        }
        if (!isDefenseLayer && isDefenseCard) {
          // Defense card dropped on main layer - reject
          return
        }
        
        // Get existing card from appropriate layer
        let existingCard: GameCardProps | null = null
        
        if (isDefenseLayer) {
          // Defense layer placement
          const currentDefenseLayer = isPlayer2 ? player2DefenseLayer : player1DefenseLayer
          existingCard = currentDefenseLayer[slotIndex]
          
          if (isPlayer2) {
            setPlayer2DefenseLayer((prev) => {
              const newLayer = [...prev]
              newLayer[slotIndex] = { type: droppedCard.type, value: droppedCard.value }
              return newLayer
            })
          } else {
            setPlayer1DefenseLayer((prev) => {
              const newLayer = [...prev]
              newLayer[slotIndex] = { type: droppedCard.type, value: droppedCard.value }
              return newLayer
            })
          }
        } else {
          // Main board placement
          const currentBoard = isPlayer2 ? player2Board : player1Board
          existingCard = currentBoard[slotIndex]
          
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
        }

        // If there was an existing card, add it back to the current player's hand BEFORE playing the new card
        if (existingCard) {
          addCardToHand(existingCard)
        }

        // Play the new card (removes it from hand and uses a move)
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
    <div className="w-full mx-auto">
      {/* Main Layout with Side Status Bars */}
      <div className="flex gap-4 items-start justify-center">
        {/* Left Status Panel */}
        <div className="w-60 flex-shrink-0">
          <GameStatus 
            gameState={gameState} 
            actionLog={actionLog} 
            onEndTurn={endTurn} 
            onResetGame={handleResetGame}
            position="left"
          />
        </div>

        {/* 3D Game Board Container - Fixed width to prevent expansion */}
        <div className="w-fit max-w-4xl relative perspective-[1000px]">
        {/* Main 3D Game Board */}
        <div className="relative bg-gradient-to-b from-blue-300/100 via-blue-50/90 to-red-200/90 backdrop-blur-sm rounded-3xl shadow-2xl  transform-gpu preserve-3d" 
             style={{ transform: 'rotateX(25deg) ' }}>
          
          {/* Board Inner Shadow */}
          <div className="absolute inset-4 bg-gradient-to-br from-white-50/50 to-white-100/50 rounded-2xl shadow-inner"></div>
          
          {/* Game Board Layout */}
          <div className="relative z-10 p-8">
            
            {/* Top Player Area (Player 1) */}
            <div ref={player1AreaRef}>
              <div className="bg-gradient-to-b from-blue-100/80 to-blue-200/80 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-300/50 shadow-lg">
                <h3 className="text-sm font-bold text-center text-blue-800">
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
                      
                      {/* Defense Layer - Only for shield/firewall cards */}
                      <CardSlot
                        card={player1DefenseLayer[index] || undefined}
                        isEmpty={!player1DefenseLayer[index]}
                        onDrop={handleCardDrop(index, false, true)}
                      />
                      
                      {/* Main Card Slot - All cards except defense */}
                      <CardSlot
                        card={card || undefined}
                        isEmpty={!card}
                        onDrop={handleCardDrop(index, false, false)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Center Area - Deck and Special Cards */}
            <div className="flex justify-center items-center  py-6">
              <div className="flex items-center space-x-8">
                {/* Left Deck */}
                <div 
                  className={`relative transform transition-transform cursor-pointer ${
                    gameState.movesRemaining > 0 && !gameState.gameOver && gameState.deck.length > 0 && currentPlayerHand.length < 7
                      ? 'hover:scale-110 hover:shadow-xl' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (gameState.movesRemaining > 0 && !gameState.gameOver && gameState.deck.length > 0 && currentPlayerHand.length < 7) {
                      drawCard(gameState.currentPlayer)
                    }
                  }}
                  title={
                    gameState.deck.length === 0 
                      ? "Deck is empty" 
                      : gameState.movesRemaining <= 0 
                        ? "No moves remaining" 
                        : gameState.gameOver 
                          ? "Game is over" 
                          : currentPlayerHand.length >= 7
                            ? "Hand is full (maximum 7 cards)"
                            : `Click to draw a card (${gameState.movesRemaining} moves left)`
                  }
                >
                  <GameCard type="attack" value={0} />
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-lg backdrop-blur-sm"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm drop-shadow-lg">DECK</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                    {gameState.deck.length}
                  </div>
                  {gameState.movesRemaining > 0 && !gameState.gameOver && gameState.deck.length > 0 && currentPlayerHand.length < 7 && (
                    <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg animate-pulse">
                      Click to Draw
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Bottom Player Area (Player 2) */}
            <div ref={player2AreaRef}>
              <div className="bg-gradient-to-t from-red-100/80 to-red-200/80 backdrop-blur-sm rounded-xl p-4 border-2 border-red-300/50 shadow-lg">
                <h3 className="text-sm font-bold mb-3 text-center text-red-800">
                  Player 2 Area
                  {gameState.currentPlayer === "player2" && <span className="ml-2 text-blue-600 font-bold">(Active)</span>}
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {player2Board.slice(0, 4).map((card, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      {/* Main Card Slot - All cards except defense */}
                      <CardSlot
                        card={card || undefined}
                        isEmpty={!card}
                        onDrop={handleCardDrop(index, true, false)}
                      />
                      
                      {/* Defense Layer - Only for shield/firewall cards */}
                      <CardSlot
                        card={player2DefenseLayer[index] || undefined}
                        isEmpty={!player2DefenseLayer[index]}
                        onDrop={handleCardDrop(index, true, true)}
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

            {/* Player Hand - Positioned after Player 2 area */}
            <div className="flex justify-center mt-8 mb-4 z-0 pointer-events-none">
              <div className="bg-gradient-to-t from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl p-4 border border-gray-600/50 shadow-2xl pointer-events-auto w-fit max-w-5xl">
                <h3 className="text-lg font-bold mb-3 text-center text-white z-0">
                  Your Hand 
                  <span className={`ml-2 text-sm font-normal ${
                    currentPlayerHand.length >= 7 ? 'text-red-400' : 
                    currentPlayerHand.length >= 6 ? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                    ({currentPlayerHand.length}/7)
                  </span>
                  <span className="ml-4 text-sm text-gray-300 font-normal">
                    {targetingMode 
                      ? `Targeting with ${targetingMode.card.type} - Click a server to target`
                      : currentPlayerHand.length >= 7
                        ? "Hand is full! Play cards to make room"
                        : gameState.movesRemaining > 0 && !gameState.gameOver
                          ? `Click cards to play them (${gameState.movesRemaining} moves left)`
                          : gameState.gameOver
                            ? "Game Over"
                            : "No moves remaining - turn will end automatically"}
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
                <div className="flex justify-center space-x-2 overflow-x-auto max-w-screen-lg z-50 py-4 px-2">
                  {currentPlayerHand.map((card: GameCardProps, index: number) => (
                    <div key={index} className="transform hover:-translate-y-1 transition-transform flex-shrink-0 hover:z-50">
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
            onEndTurn={endTurn} 
            onResetGame={handleResetGame}
            position="right"
          />
        </div>
      </div>
    </div>
  )
}