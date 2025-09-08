"use client"

import { useState, useCallback } from "react"
import type { GameCardProps } from "@/components/game-card"

export type GamePhase = "draw" | "play" | "attack" | "end"
export type Player = "player1" | "player2"

export interface GameState {
  currentPlayer: Player
  currentPhase: GamePhase
  turn: number
  player1Score: number
  player2Score: number
  player1Health: number
  player2Health: number
  gameOver: boolean
  winner: Player | null
}

const initialGameState: GameState = {
  currentPlayer: "player1",
  currentPhase: "draw",
  turn: 1,
  player1Score: 0,
  player2Score: 0,
  player1Health: 20,
  player2Health: 20,
  gameOver: false,
  winner: null,
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [actionLog, setActionLog] = useState<string[]>([])

  const addToLog = useCallback((message: string) => {
    setActionLog((prev) => [...prev.slice(-4), message])
  }, [])

  const nextPhase = useCallback(() => {
    setGameState((prev) => {
      const phases: GamePhase[] = ["draw", "play", "attack", "end"]
      const currentIndex = phases.indexOf(prev.currentPhase)
      const nextIndex = (currentIndex + 1) % phases.length

      if (nextIndex === 0) {
        // New turn
        const nextPlayer = prev.currentPlayer === "player1" ? "player2" : "player1"
        addToLog(`Turn ${prev.turn + 1}: ${nextPlayer === "player1" ? "Player 1" : "Player 2"}'s turn`)
        return {
          ...prev,
          currentPhase: phases[nextIndex],
          currentPlayer: nextPlayer,
          turn: prev.turn + 1,
        }
      }

      return {
        ...prev,
        currentPhase: phases[nextIndex],
      }
    })
  }, [addToLog])

  const playCard = useCallback(
    (card: GameCardProps, targetPlayer?: Player) => {
      setGameState((prev) => {
        if (prev.currentPhase !== "play") return prev

        const newState = { ...prev }
        const playerName = prev.currentPlayer === "player1" ? "Player 1" : "Player 2"

        // Calculate card effects
        if (card.type === "attack" && targetPlayer) {
          const damage = card.value || 0
          if (targetPlayer === "player1") {
            newState.player1Health = Math.max(0, prev.player1Health - damage)
            addToLog(`${playerName} attacks Player 1 for ${damage} damage`)
          } else {
            newState.player2Health = Math.max(0, prev.player2Health - damage)
            addToLog(`${playerName} attacks Player 2 for ${damage} damage`)
          }
        } else if (card.type === "shield") {
          const healing = card.value || 0
          if (prev.currentPlayer === "player1") {
            newState.player1Health = Math.min(20, prev.player1Health + healing)
            addToLog(`${playerName} heals for ${healing} health`)
          } else {
            newState.player2Health = Math.min(20, prev.player2Health + healing)
            addToLog(`${playerName} heals for ${healing} health`)
          }
        } else {
          addToLog(`${playerName} plays ${card.type}`)
        }

        // Add score for playing card
        if (prev.currentPlayer === "player1") {
          newState.player1Score += card.value || 0
        } else {
          newState.player2Score += card.value || 0
        }

        // Check win conditions
        if (newState.player1Health <= 0) {
          newState.gameOver = true
          newState.winner = "player2"
          addToLog("Player 2 wins!")
        } else if (newState.player2Health <= 0) {
          newState.gameOver = true
          newState.winner = "player1"
          addToLog("Player 1 wins!")
        }

        return newState
      })
    },
    [addToLog],
  )

  const resetGame = useCallback(() => {
    setGameState(initialGameState)
    setActionLog([])
    addToLog("New game started!")
  }, [addToLog])

  return {
    gameState,
    actionLog,
    nextPhase,
    playCard,
    resetGame,
  }
}
