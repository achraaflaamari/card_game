"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { GameCard, type GameCardProps, type CardType } from "./game-card"
import { CardSlot } from "./card-slot"
import { GameStatus } from "./game-status"
import { useGameState } from "@/hooks/use-game-state"
import { FULL_DECK } from "@/lib/deck"

// Sample game data using the new card structure
const initialPlayerHand: GameCardProps[] = [
  {
    type: "attack",
    category: "SQL INJECTION",
    value: 5
  },
  {
    type: "defence",
    category: "FIREWALL",
    value: 3
  },
  {
    type: "utility",
    category: "VIRUS SCAN",
    value: 4
  },
  {
    type: "defence",
    category: "MULTI-FACTOR",
    value: 2
  },
  {
    type: "attack",
    category: "PHISHING",
    value: 6
  },
]

// Defense layer - defence cards only
const initialPlayer1DefenseLayer = [
  null,
  null,
  null,
  null,
]

const initialPlayer2DefenseLayer = [
  null,
  null,
  null,
  null,
]

export function GameBoard() {
  const { gameState, endTurn, playCard, resetGame, damageSPV, restoreSPV, isInitialized, drawCard, addCardToHand } = useGameState()
  const [actionLog, setActionLog] = useState<string[]>([])
  const [selectedCard, setSelectedCard] = useState<GameCardProps | null>(null)
  const [draggedCard, setDraggedCard] = useState<GameCardProps | null>(null)
  const [validDropZones, setValidDropZones] = useState<number[]>([])
  const [targetingMode, setTargetingMode] = useState<{card: GameCardProps, player?: string} | null>(null)
  const [selectedDefenseCard, setSelectedDefenseCard] = useState<GameCardProps | null>(null)
  const [showCardLibrary, setShowCardLibrary] = useState(false)
  const [selectedLibraryCard, setSelectedLibraryCard] = useState<GameCardProps | null>(null)

  // Remove board states for attack/utility cards
  
  // Defense layers - separate layer for defense cards only
  const [player1DefenseLayer, setPlayer1DefenseLayer] = useState<(GameCardProps | null)[]>(initialPlayer1DefenseLayer)
  const [player2DefenseLayer, setPlayer2DefenseLayer] = useState<(GameCardProps | null)[]>(initialPlayer2DefenseLayer)
  
  // Defense health tracking - each defense card has its own health points
  const [player1DefenseHealth, setPlayer1DefenseHealth] = useState<number[]>([0, 0, 0, 0])
  const [player2DefenseHealth, setPlayer2DefenseHealth] = useState<number[]>([0, 0, 0, 0])

  // Refs for player areas
  const player1AreaRef = useRef<HTMLDivElement>(null)
  const player2AreaRef = useRef<HTMLDivElement>(null)
  const lastActivePlayerRef = useRef<string>(gameState.currentPlayer)

  // Always show Player 2's hand (human player)
  const currentPlayerHand = gameState.player2Hand

  // Auto-scroll to active player area and handle NPC turns
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

    // Handle NPC (Player 1) turn
    if (gameState.currentPlayer === "player1" && gameState.movesRemaining > 0 && !gameState.gameOver) {
      // Delay NPC actions to make it feel more natural
      const npcTurnDelay = setTimeout(() => {
        executeNPCTurn()
      }, 1500)

      return () => clearTimeout(npcTurnDelay)
    }
  }, [gameState.currentPlayer, gameState.movesRemaining, gameState.gameOver])

  // Function to add action logs
  const addActionLog = (message: string) => {
    setActionLog((prev: string[]) => [...prev, message])
    console.log(message) // Keep console log for debugging
  }

  // Custom playCard function to handle utility and defense cards
  const handlePlayCard = (card: GameCardProps, targetPlayer?: "player1" | "player2", targetIndex?: number) => {
    const currentPlayerName = gameState.currentPlayer === "player1" ? "Player 1 (NPC)" : "Player 2 (You)";
    
    if (card.type === "utility") {
      // Utility card - restore SPV health
      if (targetPlayer && targetIndex !== undefined) {
        const currentSPV = targetPlayer === "player1" 
          ? gameState.player1SPV[targetIndex] 
          : gameState.player2SPV[targetIndex];
        
        // Cannot heal destroyed servers (SPV = 0)
        if (currentSPV === 0) {
          addActionLog(`${currentPlayerName} tried to heal destroyed Server ${targetIndex + 1} - Action failed!`);
          return; // Exit without consuming card or move
        }
        
        // Remove card from hand and handle moves only if action is valid
        playCard(card);
        
        if (currentSPV < 5) {
          const restoreAmount = Math.min(card.value || 0, 5 - currentSPV);
          restoreSPV(targetPlayer, targetIndex, restoreAmount);
          addActionLog(`${currentPlayerName} played ${card.category} (${card.value}) to heal Server ${targetIndex + 1} by ${restoreAmount} SPV`);
        }
      }
    } else if (card.type === "attack" && targetPlayer && targetIndex !== undefined) {
      // Remove card from hand and handle moves for attack cards
      playCard(card);
      
      const defenseLayer = targetPlayer === "player1" ? player1DefenseLayer : player2DefenseLayer;
      const defenseCard = defenseLayer[targetIndex];
      const defenseHealth = targetPlayer === "player1" ? player1DefenseHealth : player2DefenseHealth;
      const targetPlayerName = targetPlayer === "player1" ? "Player 1" : "Player 2";
      
      if (defenseCard && defenseHealth[targetIndex] > 0) {
        const attackDamage = card.value || 0;
        const currentDefenseHealth = defenseHealth[targetIndex];
        
        if (attackDamage >= currentDefenseHealth) {
          const remainingDamage = attackDamage - currentDefenseHealth;
          addActionLog(`${currentPlayerName} played ${card.category} (${attackDamage}) vs ${defenseCard.category} (${currentDefenseHealth}) - Defense destroyed!`);
          
          // Remove defense card and reset its health
          if (targetPlayer === "player1") {
            setPlayer1DefenseLayer(prev => {
              const newLayer = [...prev];
              newLayer[targetIndex] = null;
              return newLayer;
            });
            setPlayer1DefenseHealth(prev => {
              const newHealth = [...prev];
              newHealth[targetIndex] = 0;
              return newHealth;
            });
          } else {
            setPlayer2DefenseLayer(prev => {
              const newLayer = [...prev];
              newLayer[targetIndex] = null;
              return newLayer;
            });
            setPlayer2DefenseHealth(prev => {
              const newHealth = [...prev];
              newHealth[targetIndex] = 0;
              return newHealth;
            });
          }
          
          // Apply remaining damage to SPV only if there is remaining damage
          if (remainingDamage > 0) {
            damageSPV(targetPlayer, targetIndex, remainingDamage);
            addActionLog(`Remaining ${remainingDamage} damage applied to ${targetPlayerName} Server ${targetIndex + 1}`);
          }
        } else {
          // Attack is less than defense health - only reduce defense health, no SPV damage
          const newDefenseHealth = currentDefenseHealth - attackDamage;
          addActionLog(`${currentPlayerName} played ${card.category} (${attackDamage}) vs ${defenseCard.category} - Defense reduced to ${newDefenseHealth}`);
          
          if (targetPlayer === "player1") {
            setPlayer1DefenseHealth(prev => {
              const newHealth = [...prev];
              newHealth[targetIndex] = newDefenseHealth;
              return newHealth;
            });
          } else {
            setPlayer2DefenseHealth(prev => {
              const newHealth = [...prev];
              newHealth[targetIndex] = newDefenseHealth;
              return newHealth;
            });
          }
          // NO SPV damage when attack is absorbed by defense
        }
      } else {
        addActionLog(`${currentPlayerName} played ${card.category} (${card.value}) - Direct hit to ${targetPlayerName} Server ${targetIndex + 1}`);
        damageSPV(targetPlayer, targetIndex, card.value||0);
      }
    } else if (card.type === "defence") {
      // Remove card from hand and handle moves for defense cards
      playCard(card);
      addActionLog(`${currentPlayerName} placed ${card.category} (${card.value} defense points)`);
    }
  }

  // Easy-level NPC intelligence for Player 1
  const executeNPCTurn = () => {
    if (gameState.currentPlayer !== "player1" || gameState.movesRemaining <= 0 || gameState.gameOver) {
      return
    }

    // Get NPC hand and defense state
    const npcHand = [...gameState.player1Hand]
    const npcDefenseLayer = [...player1DefenseLayer]
    
    // Easy AI strategy:
    // 1. First priority: Play defense cards if any SPV is low
    // 2. Second priority: Play utility cards to heal low SPVs
    // 3. Third priority: Play attack cards on player's weakest SPV
    // 4. If no good moves, draw a card or end turn

    // Check for defense cards to play
    const defenseCards = npcHand.filter(card => card.type === "defence")
    if (defenseCards.length > 0) {
      // Find the first empty defense slot with a non-destroyed server
      const npcSPVs = gameState.player1SPV
      let validDefenseSlotIndex = -1
      
      for (let i = 0; i < npcDefenseLayer.length; i++) {
        if (npcDefenseLayer[i] === null && npcSPVs[i] > 0) {
          validDefenseSlotIndex = i
          break
        }
      }
      
      if (validDefenseSlotIndex !== -1) {
        // Play the first defense card
        const defenseCard = defenseCards[0]
        handlePlayCard(defenseCard)
        setPlayer1DefenseLayer(prev => {
          const newLayer = [...prev]
          newLayer[validDefenseSlotIndex] = defenseCard
          return newLayer
        })
        // Set defense card health to its value
        setPlayer1DefenseHealth(prev => {
          const newHealth = [...prev]
          newHealth[validDefenseSlotIndex] = defenseCard.value || 0
          return newHealth
        })
        return
      }
    }

    // Check for utility cards to play (heal low SPVs)
    const utilityCards = npcHand.filter(card => card.type === "utility")
    if (utilityCards.length > 0) {
      // Find NPC's lowest SPV
      const npcSPVs = gameState.player1SPV
      let lowestSPVIndex = 0
      let lowestSPVValue = npcSPVs[0]
      
      for (let i = 1; i < npcSPVs.length; i++) {
        if (npcSPVs[i] < lowestSPVValue) {
          lowestSPVIndex = i
          lowestSPVValue = npcSPVs[i]
        }
      }
      
      // Heal the lowest SPV if it's not at max and not destroyed
      if (lowestSPVValue < 5 && lowestSPVValue > 0) {
        const utilityCard = utilityCards[0]
        handlePlayCard(utilityCard, "player1", lowestSPVIndex)
        return
      }
    }

    // Check for attack cards to play
    const attackCards = npcHand.filter(card => card.type === "attack")
    if (attackCards.length > 0) {
      // Find player's weakest SPV (lowest value)
      const playerSPVs = gameState.player2SPV
      let weakestSPVIndex = 0
      let weakestSPVValue = playerSPVs[0]
      
      for (let i = 1; i < playerSPVs.length; i++) {
        if (playerSPVs[i] < weakestSPVValue) {
          weakestSPVIndex = i
          weakestSPVValue = playerSPVs[i]
        }
      }
      
      // Play the first attack card on the weakest SPV
      const attackCard = attackCards[0]
      handlePlayCard(attackCard, "player2", weakestSPVIndex)
      return
    }

    // If we have cards but can't play them, try to draw or end turn
    if (npcHand.length < 7 && gameState.deck.length > 0) {
      drawCard("player1")
    } else {
      // No good moves, end turn
      endTurn()
    }
  }

  const handleDragStart =
    (card: GameCardProps, fromHand = false) =>
    (e: React.DragEvent) => {
      // Prevent dragging during NPC turn
      if (gameState.currentPlayer === "player1") {
        e.preventDefault()
        return
      }
      
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

  // Simplified card placement - only for defense cards
  const handleDefenseCardDrop =
    (slotIndex: number, isPlayer2 = false) =>
    (droppedCard: GameCardProps & { fromHand?: boolean }) => {
      // Prevent dropping during NPC turn
      if (gameState.currentPlayer === "player1") {
        return
      }
      
      if (gameState.movesRemaining <= 0 || gameState.gameOver) {
        return
      }

      if (droppedCard.fromHand && droppedCard.type === "defence") {
        // Check if player is trying to place card in their own zone
        const isCurrentPlayerZone = (gameState.currentPlayer === "player2" && isPlayer2) 

        if (!isCurrentPlayerZone) {
          return
        }
        
        // Check if the server is destroyed (SPV = 0)
        const targetSPV = isPlayer2 ? gameState.player2SPV[slotIndex] : gameState.player1SPV[slotIndex];
        if (targetSPV === 0) {
          addActionLog(`Cannot place defense on destroyed Server ${slotIndex + 1} - Server must be repaired first!`);
          return; // Exit without consuming card or move
        }
        
        // Get existing defense card
        const currentDefenseLayer = isPlayer2 ? player2DefenseLayer : player1DefenseLayer
        const existingCard = currentDefenseLayer[slotIndex]
        
        // Place defense card
        if (isPlayer2) {
          setPlayer2DefenseLayer((prev) => {
            const newLayer = [...prev]
            newLayer[slotIndex] = { 
              type: droppedCard.type, 
              category: droppedCard.category,
              value: droppedCard.value 
            }
            return newLayer
          })
        } else {
          setPlayer1DefenseLayer((prev) => {
            const newLayer = [...prev]
            newLayer[slotIndex] = { 
              type: droppedCard.type, 
              category: droppedCard.category,
              value: droppedCard.value 
            }
            return newLayer
          })
        }

        // If there was an existing card, add it back to hand
        if (existingCard) {
          addCardToHand(existingCard)
        }

        // Play the new card
        handlePlayCard(droppedCard)
      }
    }

  const handleCardClick = (card: GameCardProps) => {
    // Prevent clicking during NPC turn
    if (gameState.currentPlayer === "player1") {
      return
    }
    
    if (gameState.gameOver) return
    
    // If card requires targeting (attack or utility), enter targeting mode
    if (card.type === "attack" || card.type === "utility") {
      setTargetingMode({ card })
      setSelectedCard(card)
      setSelectedDefenseCard(null)
    } else if (card.type === "defence") {
      // For defense cards, enter defense placement mode
      setSelectedDefenseCard(card)
      setSelectedCard(card)
      setTargetingMode(null)
    }
  }

  const handleSPVClick = (player: "player1" | "player2", slotIndex: number) => {
    // Prevent clicking during NPC turn
    if (gameState.currentPlayer === "player1") {
      return
    }
    
    if (gameState.gameOver) return
    
    if (targetingMode) {
      // Prevent attacking your own SPV or healing enemy SPV
      if (targetingMode.card.type === "attack" && player === "player2") {
        // Can't attack your own SPV
        return
      }
      
      if (targetingMode.card.type === "utility" && player === "player1") {
        // Can't heal enemy SPV
        return
      }
      
      // Check if target is valid before playing the card
      if (targetingMode.card.type === "utility") {
        const targetSPV = player === "player1" ? gameState.player1SPV[slotIndex] : gameState.player2SPV[slotIndex];
        if (targetSPV === 0) {
          addActionLog(`Cannot heal destroyed Server ${slotIndex + 1} - Server must be repaired first!`);
          setTargetingMode(null)
          setSelectedCard(null)
          return;
        }
      }
      
      // Play the targeted card
      handlePlayCard(targetingMode.card, player, slotIndex)
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
    setPlayer1DefenseLayer(initialPlayer1DefenseLayer)
    setPlayer2DefenseLayer(initialPlayer2DefenseLayer)
    setPlayer1DefenseHealth([0, 0, 0, 0])
    setPlayer2DefenseHealth([0, 0, 0, 0])
    setSelectedCard(null)
    setSelectedDefenseCard(null)
    setTargetingMode(null)
  }

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

  return (
    <div className="w-full mx-auto ">
      {/* NPC Turn Indicator */}
      {gameState.currentPlayer === "player1" && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          NPC's Turn - Thinking...
        </div>
      )}

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
            
            {/* Top Player Area (Player 1 - NPC) */}
            <div ref={player1AreaRef}>
              <div className="bg-gradient-to-b from-blue-100/80 to-blue-200/80 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-300/50 shadow-lg">
                <h3 className="text-sm font-bold text-center text-blue-800">
                  Player 1 Area (NPC)
                  {gameState.currentPlayer === "player1" && <span className="ml-2 text-green-600 font-bold">(Active)</span>}
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      {/* SPV Health Indicator */}
                      <div 
                        className={`transform scale-75 cursor-pointer hover:scale-80 transition-transform ${
                          targetingMode ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''
                        }`}
                        onClick={() => handleSPVClick("player1", index)}
                        title={targetingMode 
                          ? targetingMode.card.type === "attack"
                            ? `Target Player 1 Server ${index + 1} with ${targetingMode.card.type}` 
                            : `Cannot heal enemy server`
                          : `Player 1 Server ${index + 1} - SPV: ${gameState.player1SPV[index]}/5`}
                      >
                        <GameCard 
                          type="defence" 
                          category="BACKUP" 
                          value={gameState.player1SPV[index]} 
                        />
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
                      
                      {/* Defense Layer - Only for defence cards */}
                      <div 
                        className={`w-35 h-49 relative border-2 rounded-xl flex items-center justify-center transition-all duration-300 transform-gpu backdrop-blur-sm hover:scale-105 hover:shadow-xl cursor-pointer ${
                          selectedDefenseCard && gameState.currentPlayer === "player2" 
                            ? 'border-solid border-green-400 bg-gradient-to-br from-green-100/40 to-emerald-200/40 animate-pulse shadow-lg shadow-green-400/30' 
                            : 'border-dashed border-blue-300/50'
                        }`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const cardData = e.dataTransfer.getData("application/json")
                          if (cardData) {
                            const card = JSON.parse(cardData)
                            handleDefenseCardDrop(index, false)(card)
                          }
                        }}
                        onClick={() => {
                          if (selectedDefenseCard && gameState.currentPlayer === "player2") {
                            // Check if the server is destroyed (SPV = 0)
                            const currentSPV = gameState.player1SPV[index];
                            if (currentSPV === 0) {
                              addActionLog(`Cannot place defense on destroyed Server ${index + 1} - Server must be repaired first!`);
                              setSelectedDefenseCard(null);
                              setSelectedCard(null);
                              return;
                            }
                            
                            // Get existing defense card
                            const existingCard = player1DefenseLayer[index]
                            
                            // Place defense card
                            setPlayer1DefenseLayer((prev) => {
                              const newLayer = [...prev]
                              newLayer[index] = { 
                                type: selectedDefenseCard.type, 
                                category: selectedDefenseCard.category,
                                value: selectedDefenseCard.value 
                              }
                              return newLayer
                            })
                            
                            // Set defense card health to its value
                            setPlayer1DefenseHealth((prev) => {
                              const newHealth = [...prev]
                              newHealth[index] = selectedDefenseCard.value || 0
                              return newHealth
                            })

                            // If there was an existing card, add it back to hand
                            if (existingCard) {
                              addCardToHand(existingCard)
                            }

                            // Play the new card
                            handlePlayCard(selectedDefenseCard)
                            
                            // Clear selection
                            setSelectedDefenseCard(null)
                            setSelectedCard(null)
                          }
                        }}
                      >
                        {player1DefenseLayer[index] ? (
                          <div className="relative w-full h-full">
                            <GameCard
                              {...player1DefenseLayer[index]}
                              className="absolute inset-0"
                            />
                            {/* Defense Health Indicator */}
                            <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded-full font-bold shadow-lg min-w-[20px] text-center">
                              {player1DefenseHealth[index]}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-blue-400 text-center">Defense</span>
                        )}
                      </div>
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
                    if (gameState.currentPlayer === "player1") return // Prevent drawing during NPC turn
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
                  <GameCard 
                    type="utility" 
                    category="PATCH" 
                    value={0} 
                  />
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
            {/* Bottom Player Area (Player 2 - Human) */}
            <div ref={player2AreaRef}>
              <div className="bg-gradient-to-t from-red-100/80 to-red-200/80 backdrop-blur-sm rounded-xl p-4 border-2 border-red-300/50 shadow-lg">
                <h3 className="text-sm font-bold mb-3 text-center text-red-800">
                  Player 2 Area (You)
                  {gameState.currentPlayer === "player2" && <span className="ml-2 text-blue-600 font-bold">(Active)</span>}
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      {/* Defense Layer - Only for defence cards */}
                      <div 
                        className={`w-35 h-49 relative border-2 rounded-xl flex items-center justify-center transition-all duration-300 transform-gpu backdrop-blur-sm hover:scale-105 hover:shadow-xl cursor-pointer ${
                          selectedDefenseCard && gameState.currentPlayer === "player2" 
                            ? 'border-solid border-green-400 bg-gradient-to-br from-green-100/40 to-emerald-200/40 animate-pulse shadow-lg shadow-green-400/30' 
                            : 'border-dashed border-red-300/50'
                        }`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const cardData = e.dataTransfer.getData("application/json")
                          if (cardData) {
                            const card = JSON.parse(cardData)
                            handleDefenseCardDrop(index, true)(card)
                          }
                        }}
                        onClick={() => {
                          if (selectedDefenseCard && gameState.currentPlayer === "player2") {
                            // Check if the server is destroyed (SPV = 0)
                            const currentSPV = gameState.player2SPV[index];
                            if (currentSPV === 0) {
                              addActionLog(`Cannot place defense on destroyed Server ${index + 1} - Server must be repaired first!`);
                              setSelectedDefenseCard(null);
                              setSelectedCard(null);
                              return;
                            }
                            
                            // Get existing defense card
                            const existingCard = player2DefenseLayer[index]
                            
                            // Place defense card
                            setPlayer2DefenseLayer((prev) => {
                              const newLayer = [...prev]
                              newLayer[index] = { 
                                type: selectedDefenseCard.type, 
                                category: selectedDefenseCard.category,
                                value: selectedDefenseCard.value 
                              }
                              return newLayer
                            })
                            
                            // Set defense card health to its value
                            setPlayer2DefenseHealth((prev) => {
                              const newHealth = [...prev]
                              newHealth[index] = selectedDefenseCard.value || 0
                              return newHealth
                            })

                            // If there was an existing card, add it back to hand
                            if (existingCard) {
                              addCardToHand(existingCard)
                            }

                            // Play the new card
                            handlePlayCard(selectedDefenseCard)
                            
                            // Clear selection
                            setSelectedDefenseCard(null)
                            setSelectedCard(null)
                          }
                        }}
                      >
                        {player2DefenseLayer[index] ? (
                          <div className="relative w-full h-full">
                            <GameCard
                              {...player2DefenseLayer[index]}
                              className="absolute inset-0"
                            />
                            {/* Defense Health Indicator */}
                            <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded-full font-bold shadow-lg min-w-[20px] text-center">
                              {player2DefenseHealth[index]}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-red-400 text-center">Defense</span>
                        )}
                      </div>
                      
                      {/* SPV Health Indicator */}
                      <div 
                        className={`transform scale-75 transition-transform ${
                          targetingMode 
                            ? targetingMode.card.type === "utility" 
                              ? 'ring-2 ring-green-400 ring-opacity-75 cursor-pointer' 
                              : 'cursor-not-allowed opacity-75'
                            : 'cursor-not-allowed opacity-75'
                        }`}
                        onClick={() => handleSPVClick("player2", index)}
                        title={
                          targetingMode 
                            ? targetingMode.card.type === "utility"
                              ? `Heal Player 2 Server ${index + 1} with ${targetingMode.card.type}` 
                              : `Cannot attack your own server`
                            : `Player 2 Server ${index + 1} - SPV: ${gameState.player2SPV[index]}/5`
                        }
                      >
                        <GameCard 
                          type="defence" 
                          category="PROXY SERVER" 
                          value={gameState.player2SPV[index]} 
                        />
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
            <div className="  sticky bottom-0 flex justify-center mt-8 mb-4 z-0 pointer-events-none">
              <div className="bg-gradient-to-t from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl p-4 border border-gray-600/50 shadow-2xl pointer-events-auto w-fit max-w-6xl">
                <h3 className="text-lg font-bold mb-3 text-center text-white z-0">
                  Your Hand 
                  <span className={`ml-2 text-sm font-normal ${
                    currentPlayerHand.length >= 7 ? 'text-red-400' : 
                    currentPlayerHand.length >= 6 ? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                    ({currentPlayerHand.length}/7)
                  </span>
                  <span className="ml-4 text-sm text-gray-300 font-normal">
                    {gameState.currentPlayer === "player1" 
                      ? "NPC's turn - waiting..." 
                      : targetingMode 
                        ? targetingMode.card.type === "attack"
                          ? `Targeting with ${targetingMode.card.type} - Click an enemy server to attack`
                          : `Targeting with ${targetingMode.card.type} - Click your server to heal`
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
                      className="ml-4 px-2 py-1 bg-red-600 hover:red-700 text-white text-xs rounded transition-colors"
                      onClick={() => {
                        setTargetingMode(null)
                        setSelectedCard(null)
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </h3>
                <div className="flex justify-center items-end overflow-x-hidden max-w-screen-lg z-50 py-4 px-2 relative min-h-[80px]">
                  {currentPlayerHand.map((card: GameCardProps, index: number) => (
                    <div 
                      key={index} 
                      className="transform translate-y-1 hover:-translate-y-0.5 hover:scale-100 transition-all duration-200 flex-shrink-0 relative group"
                      style={{
                        marginLeft: index > 0 ? '-40px' : '0px',
                        zIndex: selectedCard === card ? 100 : 50 - index,
                        transform: selectedCard === card ? 'translateY(-2px) scale(1.05)' : ''
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.zIndex = '999'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.zIndex = selectedCard === card ? '100' : (50 - index).toString()
                      }}
                    >
                      <GameCard
                        {...card}
                        isActive={selectedCard === card}
                        isDragging={draggedCard === card}
                        onClick={() => handleCardClick(card)}
                        onDragStart={handleDragStart(card, true)}
                        onDragEnd={handleDragEnd}
                        className="shadow-lg"
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
            onResetGame={resetGame} 
            onOpenCardLibrary={() => setShowCardLibrary(true)}
            position="right" 
          />
        </div>
      </div>


      {/* Card Library Modal */}
      {showCardLibrary && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-gray-600">
            <div className="flex items-center justify-between p-6 border-b border-gray-600">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                Card Library
              </h2>
              <button 
                onClick={() => { setShowCardLibrary(false); setSelectedLibraryCard(null) }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/3 border-r border-gray-600 p-6 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
                {selectedLibraryCard ? (
                  <div className=" w-full h-full grid justify-center items-center">
                      <GameCard {...selectedLibraryCard} size="large" hoverEffect={false}/>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    Select a card to view details
                  </div>
                )}
              </div>
              <div className="flex-1 p-6 overflow-hidden">
                <div className="h-full overflow-y-auto overflow-x-hidden">
                  <div className="grid grid-cols-4 gap-4 px-2">
                    {FULL_DECK.map((card, index) => (
                      <div 
                        key={index}
                        className="cursor-pointer transform transition-transform flex-shrink-0"
                        onClick={() => setSelectedLibraryCard(card)}
                      >
                        <GameCard
                          {...card}
                          isActive={selectedLibraryCard === card}
                          className="shadow-lg w-full"
                          hoverEffect={false}
                        
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}