"use client"

import { useState, useCallback, useEffect } from "react"
import type { GameCardProps } from "@/components/game-card"
import { createNewDeck, dealInitialHands, drawCards } from "@/lib/deck"

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
  deck: GameCardProps[]
  player1Hand: GameCardProps[]
  player2Hand: GameCardProps[]
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
  deck: [],
  player1Hand: [],
  player2Hand: [],
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [actionLog, setActionLog] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const addToLog = useCallback((message: string) => {
    setActionLog((prev) => [...prev.slice(-4), message])
  }, [])

  // Initialize deck on client side to avoid hydration mismatch
  useEffect(() => {
    if (!isInitialized) {
      const shuffledDeck = createNewDeck()
      const { player1Hand, player2Hand, remainingDeck } = dealInitialHands(shuffledDeck)
      
      setGameState(prev => ({
        ...prev,
        deck: remainingDeck,
        player1Hand,
        player2Hand,
      }))
      
      setActionLog(prev => [...prev.slice(-4), "Game initialized! Cards shuffled and dealt."])
      setIsInitialized(true)
    }
  }, [isInitialized])

  const drawCard = useCallback((player: Player) => {
    setGameState((prev) => {
      if (prev.deck.length === 0) {
        addToLog("Deck is empty! No more cards to draw.")
        return prev
      }

      const { drawnCards, remainingDeck } = drawCards(prev.deck, 1)
      const drawnCard = drawnCards[0]
      
      if (!drawnCard) return prev

      const playerName = player === "player1" ? "Player 1" : "Player 2"
      addToLog(`${playerName} draws a ${drawnCard.type} card`)

      return {
        ...prev,
        deck: remainingDeck,
        player1Hand: player === "player1" ? [...prev.player1Hand, drawnCard] : prev.player1Hand,
        player2Hand: player === "player2" ? [...prev.player2Hand, drawnCard] : prev.player2Hand,
      }
    })
  }, [addToLog])

  const nextPhase = useCallback(() => {
    setGameState((prev) => {
      const phases: GamePhase[] = ["draw", "play", "attack", "end"]
      const currentIndex = phases.indexOf(prev.currentPhase)
      const nextIndex = (currentIndex + 1) % phases.length

      // Handle phase-specific actions
      if (prev.currentPhase === "draw") {
        // Draw a card immediately during draw phase transition
        if (prev.deck.length > 0) {
          const { drawnCards, remainingDeck } = drawCards(prev.deck, 1)
          const drawnCard = drawnCards[0]
          
          if (drawnCard) {
            const playerName = prev.currentPlayer === "player1" ? "Player 1" : "Player 2"
            addToLog(`${playerName} draws a ${drawnCard.type} card`)
            
            const newState = {
              ...prev,
              deck: remainingDeck,
              player1Hand: prev.currentPlayer === "player1" ? [...prev.player1Hand, drawnCard] : prev.player1Hand,
              player2Hand: prev.currentPlayer === "player2" ? [...prev.player2Hand, drawnCard] : prev.player2Hand,
            }
            
            if (nextIndex === 0) {
              // New turn
              const nextPlayer = prev.currentPlayer === "player1" ? "player2" : "player1"
              addToLog(`Turn ${newState.turn + 1}: ${nextPlayer === "player1" ? "Player 1" : "Player 2"}'s turn`)
              return {
                ...newState,
                currentPhase: phases[nextIndex],
                currentPlayer: nextPlayer,
                turn: newState.turn + 1,
              }
            }
            
            return {
              ...newState,
              currentPhase: phases[nextIndex],
            }
          }
        } else {
          addToLog("Deck is empty! No more cards to draw.")
        }
      }

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

        // Remove card from player's hand
        if (prev.currentPlayer === "player1") {
          newState.player1Hand = prev.player1Hand.filter((handCard, index) => {
            // Remove first matching card
            if (handCard.type === card.type && handCard.value === card.value) {
              return false
            }
            return true
          })
        } else {
          newState.player2Hand = prev.player2Hand.filter((handCard, index) => {
            // Remove first matching card
            if (handCard.type === card.type && handCard.value === card.value) {
              return false
            }
            return true
          })
        }

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
    // Create a fresh deck and deal new hands
    const newShuffledDeck = createNewDeck()
    const { player1Hand, player2Hand, remainingDeck } = dealInitialHands(newShuffledDeck)
    
    const newGameState: GameState = {
      currentPlayer: "player1",
      currentPhase: "draw",
      turn: 1,
      player1Score: 0,
      player2Score: 0,
      player1Health: 20,
      player2Health: 20,
      gameOver: false,
      winner: null,
      deck: remainingDeck,
      player1Hand,
      player2Hand,
    }
    
    setGameState(newGameState)
    setActionLog([])
    addToLog("New game started! Cards shuffled and dealt.")
  }, [addToLog])

  return {
    gameState,
    actionLog,
    nextPhase,
    playCard,
    resetGame,
    drawCard,
    isInitialized,
  }
}
