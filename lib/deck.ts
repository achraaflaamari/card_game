import type { GameCardProps, CardType, CardCategory } from "@/components/game-card"

// Define the complete deck of cards with proper cybersecurity content
export const FULL_DECK: GameCardProps[] = [
  // Attack cards
  {
    type: "attack",
    category: "SQL INJECTION",
    value: 2
  },
  {
    type: "attack",
    category: "DDOS ATTACK",
    value: 1
  },
  {
    type: "attack",
    category: "RANSOMWARE",
    value: 2
  },
  {
    type: "attack",
    category: "PHISHING",
    value: 3
  },
  {
    type: "attack",
    category: "BRUTE FORCE",
    value: 4
  },
  {
    type: "attack",
    category: "ZERO-DAY",
    value: 2
  },
  {
    type: "attack",
    category: "WORM",
    value: 3
  },
  {
    type: "attack",
    category: "ROOTKIT",
    value: 6
  },
  {
    type: "attack",
    category: "KEYLOGGER",
    value: 2
  },
  {
    type: "attack",
    category: "PORT SCANNER",
    value: 1
  },

  // Defence cards
  {
    type: "defence",
    category: "FIREWALL",
    value: 3
  },
  {
    type: "defence",
    category: "DATA VAULT",
    value: 2
  },
  {
    type: "defence",
    category: "HONEYPOT",
    value: 2
  },
  {
    type: "defence",
    category: "BACKUP",
    value: 1
  },
  {
    type: "defence",
    category: "MULTI-FACTOR",
    value: 2
  },
  {
    type: "defence",
    category: "ENCRYPTED",
    value: 3
  },
  {
    type: "defence",
    category: "SEGMENTATION",
    value: 2
  },
  {
    type: "defence",
    category: "DECOY SYSTEM",
    value: 1
  },
  {
    type: "defence",
    category: "PROXY SERVER",
    value: 1
  },
  {
    type: "defence",
    category: "AUDIT",
    value: 4
  },

  // Utility cards
  {
    type: "utility",
    category: "VIRUS SCAN",
    value: 1
  },
  {
    type: "utility",
    category: "FORCE REBOOT",
    value: 3
  },
  {
    type: "utility",
    category: "OVERCLOCK",
    value: 2
  },
  {
    type: "utility",
    category: "PATCH",
    value: 2
  }
]

// Create multiple copies of each card for a complete deck
const createCompleteDeck = (): GameCardProps[] => {
  const deck: GameCardProps[] = []
  
  // Add 2 copies of each card for a balanced deck
  FULL_DECK.forEach(card => {
    deck.push({...card})
    deck.push({...card})
  })
  
  return deck
}

const COMPLETE_DECK = createCompleteDeck()

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
  return shuffleDeck(COMPLETE_DECK)
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
  const INITIAL_HAND_SIZE = 3
  
  const { drawnCards: player1Hand, remainingDeck: afterPlayer1 } = drawCards(deck, INITIAL_HAND_SIZE)
  const { drawnCards: player2Hand, remainingDeck } = drawCards(afterPlayer1, INITIAL_HAND_SIZE)
  
  return {
    player1Hand,
    player2Hand,
    remainingDeck
  }
}