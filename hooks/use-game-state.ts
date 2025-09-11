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
  // SPV (Server Protection Value) - each slot has 5 health units
  player1SPV: number[] // Array of 4 SPV values (one per card slot)
  player2SPV: number[] // Array of 4 SPV values (one per card slot)
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
  player1SPV: [5, 5, 5, 5], // Each server starts with 5 health units
  player2SPV: [5, 5, 5, 5], // Each server starts with 5 health units
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
    (card: GameCardProps, targetPlayer?: Player, targetSlot?: number) => {
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
        if (card.type === "attack" && targetPlayer && targetSlot !== undefined) {
          const damage = card.value || 0
          // Attack SPV instead of player health
          if (targetPlayer === "player1") {
            newState.player1SPV = [...prev.player1SPV]
            newState.player1SPV[targetSlot] = Math.max(0, prev.player1SPV[targetSlot] - damage)
            addToLog(`${playerName} attacks Player 1 server slot ${targetSlot + 1} for ${damage} SPV damage`)
          } else {
            newState.player2SPV = [...prev.player2SPV]
            newState.player2SPV[targetSlot] = Math.max(0, prev.player2SPV[targetSlot] - damage)
            addToLog(`${playerName} attacks Player 2 server slot ${targetSlot + 1} for ${damage} SPV damage`)
          }
        } else if (card.type === "shield" && targetSlot !== undefined) {
          const healing = card.value || 0
          // Heal SPV instead of player health
          if (prev.currentPlayer === "player1") {
            newState.player1SPV = [...prev.player1SPV]
            newState.player1SPV[targetSlot] = Math.min(5, prev.player1SPV[targetSlot] + healing)
            addToLog(`${playerName} restores ${healing} SPV to server slot ${targetSlot + 1}`)
          } else {
            newState.player2SPV = [...prev.player2SPV]
            newState.player2SPV[targetSlot] = Math.min(5, prev.player2SPV[targetSlot] + healing)
            addToLog(`${playerName} restores ${healing} SPV to server slot ${targetSlot + 1}`)
          }
        } else if (card.type === "firewall") {
          // Firewall protects all servers by adding 1 SPV to each
          if (prev.currentPlayer === "player1") {
            newState.player1SPV = prev.player1SPV.map(spv => Math.min(5, spv + 1))
            addToLog(`${playerName} deploys firewall - all servers gain 1 SPV`)
          } else {
            newState.player2SPV = prev.player2SPV.map(spv => Math.min(5, spv + 1))
            addToLog(`${playerName} deploys firewall - all servers gain 1 SPV`)
          }
        } else if (card.type === "scanner") {
          // Scanner reveals opponent's SPV status (already visible, so just log)
          addToLog(`${playerName} uses scanner to analyze opponent servers`)
        } else if (card.type === "database") {
          // Database restores 2 SPV to all servers
          if (prev.currentPlayer === "player1") {
            newState.player1SPV = prev.player1SPV.map(spv => Math.min(5, spv + 2))
            addToLog(`${playerName} activates database backup - all servers restore 2 SPV`)
          } else {
            newState.player2SPV = prev.player2SPV.map(spv => Math.min(5, spv + 2))
            addToLog(`${playerName} activates database backup - all servers restore 2 SPV`)
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

        // Check win conditions - game ends when all SPV are destroyed
        const player1AllDestroyed = newState.player1SPV.every(spv => spv <= 0)
        const player2AllDestroyed = newState.player2SPV.every(spv => spv <= 0)
        
        if (player1AllDestroyed) {
          newState.gameOver = true
          newState.winner = "player2"
          addToLog("All Player 1 servers destroyed! Player 2 wins!")
        } else if (player2AllDestroyed) {
          newState.gameOver = true
          newState.winner = "player1"
          addToLog("All Player 2 servers destroyed! Player 1 wins!")
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
      player1SPV: [5, 5, 5, 5], // Reset SPV to full health
      player2SPV: [5, 5, 5, 5], // Reset SPV to full health
    }
    
    setGameState(newGameState)
    setActionLog([])
    addToLog("New game started! Cards shuffled and dealt.")
  }, [addToLog])

  const damageSPV = useCallback((player: Player, slotIndex: number, damage: number) => {
    setGameState((prev) => {
      const newState = { ...prev }
      const playerName = player === "player1" ? "Player 1" : "Player 2"
      
      if (player === "player1") {
        newState.player1SPV = [...prev.player1SPV]
        newState.player1SPV[slotIndex] = Math.max(0, prev.player1SPV[slotIndex] - damage)
        addToLog(`${playerName} server slot ${slotIndex + 1} takes ${damage} SPV damage (${newState.player1SPV[slotIndex]} remaining)`)
      } else {
        newState.player2SPV = [...prev.player2SPV]
        newState.player2SPV[slotIndex] = Math.max(0, prev.player2SPV[slotIndex] - damage)
        addToLog(`${playerName} server slot ${slotIndex + 1} takes ${damage} SPV damage (${newState.player2SPV[slotIndex]} remaining)`)
      }
      
      // Check if all SPV are destroyed
      const allSPVDestroyed = player === "player1" 
        ? newState.player1SPV.every(spv => spv <= 0)
        : newState.player2SPV.every(spv => spv <= 0)
      
      if (allSPVDestroyed) {
        newState.gameOver = true
        newState.winner = player === "player1" ? "player2" : "player1"
        addToLog(`All ${playerName} servers destroyed! ${newState.winner === "player1" ? "Player 1" : "Player 2"} wins!`)
      }
      
      return newState
    })
  }, [addToLog])

  const restoreSPV = useCallback((player: Player, slotIndex: number, amount: number) => {
    setGameState((prev) => {
      const newState = { ...prev }
      const playerName = player === "player1" ? "Player 1" : "Player 2"
      
      if (player === "player1") {
        newState.player1SPV = [...prev.player1SPV]
        newState.player1SPV[slotIndex] = Math.min(5, prev.player1SPV[slotIndex] + amount)
        addToLog(`${playerName} server slot ${slotIndex + 1} restored ${amount} SPV (${newState.player1SPV[slotIndex]}/5)`)
      } else {
        newState.player2SPV = [...prev.player2SPV]
        newState.player2SPV[slotIndex] = Math.min(5, prev.player2SPV[slotIndex] + amount)
        addToLog(`${playerName} server slot ${slotIndex + 1} restored ${amount} SPV (${newState.player2SPV[slotIndex]}/5)`)
      }
      
      return newState
    })
  }, [addToLog])

  return {
    gameState,
    actionLog,
    nextPhase,
    playCard,
    resetGame,
    drawCard,
    damageSPV,
    restoreSPV,
    isInitialized,
  }
}
