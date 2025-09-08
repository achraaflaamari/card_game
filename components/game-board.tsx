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
  const { gameState, actionLog, nextPhase, playCard, resetGame } = useGameState()
  const [playerHand, setPlayerHand] = useState(initialPlayerHand)
  const [selectedCard, setSelectedCard] = useState<GameCardProps | null>(null)
  const [draggedCard, setDraggedCard] = useState<GameCardProps | null>(null)
  const [validDropZones, setValidDropZones] = useState<number[]>([])

  const [player1Board, setPlayer1Board] = useState<(GameCardProps | null)[]>(initialPlayer1Board)
  const [player2Board, setPlayer2Board] = useState<(GameCardProps | null)[]>(initialPlayer2Board)

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
        // Remove card from hand and place on board
        setPlayerHand((prev) =>
          prev.filter((card) => !(card.type === droppedCard.type && card.value === droppedCard.value)),
        )

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
    setSelectedCard(selectedCard === card ? null : card)
  }

  const handleResetGame = () => {
    resetGame()
    setPlayerHand(initialPlayerHand)
    setPlayer1Board(initialPlayer1Board)
    setPlayer2Board(initialPlayer2Board)
    setSelectedCard(null)
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <GameStatus gameState={gameState} actionLog={actionLog} onNextPhase={nextPhase} onResetGame={handleResetGame} />

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-12 gap-4 h-[600px]">
          {/* Left Player Cards */}
          <div className="col-span-2 flex flex-col justify-center space-y-4">
            {playerCards.map((card, index) => (
              <GameCard key={`left-${index}`} {...card} />
            ))}
          </div>

          {/* Left Game Area */}
          <div className="col-span-3 bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4 text-center">
              Player 1 Area
              {gameState.currentPlayer === "player1" && <span className="ml-2 text-blue-600 font-bold">(Active)</span>}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {player1Board.map((card, index) => (
                <CardSlot
                  key={index}
                  card={card || undefined}
                  isEmpty={!card}
                  isValidDropTarget={validDropZones.includes(index)}
                  onDrop={handleCardDrop(index, false)}
                />
              ))}
            </div>
          </div>

          {/* Center Area */}
          <div className="col-span-2 flex flex-col justify-center items-center space-y-4">
            {/* Draw Pile */}
            <div className="relative">
              <GameCard type="attack" value={0} />
              <div className="absolute inset-0 bg-gray-800 rounded-lg opacity-50"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold">DECK</span>
              </div>
            </div>

            {/* Central Card */}
            <GameCard type="scanner" />
          </div>

          {/* Right Game Area */}
          <div className="col-span-3 bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4 text-center">
              Player 2 Area
              {gameState.currentPlayer === "player2" && <span className="ml-2 text-blue-600 font-bold">(Active)</span>}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {player2Board.map((card, index) => (
                <CardSlot key={index} card={card || undefined} isEmpty={!card} onDrop={handleCardDrop(index, true)} />
              ))}
            </div>
          </div>

          {/* Right Player Cards */}
          <div className="col-span-2 flex flex-col justify-center space-y-4">
            {playerCards.map((card, index) => (
              <GameCard key={`right-${index}`} {...card} />
            ))}
          </div>
        </div>

        {/* Player Hand */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Your Hand
            <span className="ml-4 text-sm text-gray-600">
              {gameState.currentPhase === "play" && !gameState.gameOver
                ? "Drag cards to play them"
                : gameState.gameOver
                  ? "Game Over"
                  : `Current Phase: ${gameState.currentPhase}`}
            </span>
          </h3>
          <div className="flex justify-center space-x-3">
            {playerHand.map((card, index) => (
              <GameCard
                key={index}
                {...card}
                isActive={selectedCard === card}
                isDragging={draggedCard === card}
                onClick={() => handleCardClick(card)}
                onDragStart={handleDragStart(card, true)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
