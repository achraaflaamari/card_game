import type { GameCardProps } from "@/components/game-card"

// Define the complete deck of cards
export const FULL_DECK: GameCardProps[] = [
  // Database cards (6 copies)
  { type: "database", value: 2 },
  { type: "database", value: 3 },
  { type: "database", value: 4 },
  { type: "database", value: 5 },
  { type: "database", value: 6 },
  { type: "database", value: 7 },
  
  // Firewall cards (6 copies)
  { type: "firewall", value: 1 },
  { type: "firewall", value: 2 },
  { type: "firewall", value: 3 },
  { type: "firewall", value: 4 },
  { type: "firewall", value: 5 },
  { type: "firewall", value: 6 },
  
  // Scanner cards (6 copies)
  { type: "scanner", value: 1 },
  { type: "scanner", value: 2 },
  { type: "scanner", value: 3 },
  { type: "scanner", value: 4 },
  { type: "scanner", value: 5 },
  { type: "scanner", value: 6 },
  
  // Shield cards (6 copies)
  { type: "shield", value: 1 },
  { type: "shield", value: 2 },
  { type: "shield", value: 3 },
  { type: "shield", value: 4 },
  { type: "shield", value: 5 },
  { type: "shield", value: 6 },
  
  // Attack cards (6 copies)
  { type: "attack", value: 2 },
  { type: "attack", value: 3 },
  { type: "attack", value: 4 },
  { type: "attack", value: 5 },
  { type: "attack", value: 6 },
  { type: "attack", value: 7 },
]

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffleDeck<T>(deck: T[]): T[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Creates a new shuffled deck
 */
export function createNewDeck(): GameCardProps[] {
  return shuffleDeck(FULL_DECK)
}

/**
 * Draws cards from the deck
 */
export function drawCards(deck: GameCardProps[], count: number): {
  drawnCards: GameCardProps[]
  remainingDeck: GameCardProps[]
} {
  const drawnCards = deck.slice(0, count)
  const remainingDeck = deck.slice(count)
  
  return {
    drawnCards,
    remainingDeck
  }
}

/**
 * Deals initial hands to both players
 */
export function dealInitialHands(deck: GameCardProps[]): {
  player1Hand: GameCardProps[]
  player2Hand: GameCardProps[]
  remainingDeck: GameCardProps[]
} {
  const INITIAL_HAND_SIZE = 5
  
  const { drawnCards: player1Hand, remainingDeck: afterPlayer1 } = drawCards(deck, INITIAL_HAND_SIZE)
  const { drawnCards: player2Hand, remainingDeck } = drawCards(afterPlayer1, INITIAL_HAND_SIZE)
  
  return {
    player1Hand,
    player2Hand,
    remainingDeck
  }
}
