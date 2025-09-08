import type React from "react"

import { cn } from "@/lib/utils"

export type CardType = "database" | "firewall" | "scanner" | "shield" | "attack" | "player"

export interface GameCardProps {
  type: CardType
  value?: number
  isActive?: boolean
  isDragging?: boolean
  className?: string
  onClick?: () => void
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
}

const cardConfig = {
  database: {
    color: "bg-blue-600",
    icon: "🗄️",
    name: "Database",
  },
  firewall: {
    color: "bg-red-600",
    icon: "🛡️",
    name: "Firewall",
  },
  scanner: {
    color: "bg-purple-600",
    icon: "🔍",
    name: "Scanner",
  },
  shield: {
    color: "bg-green-600",
    icon: "⚡",
    name: "Shield",
  },
  attack: {
    color: "bg-orange-600",
    icon: "⚔️",
    name: "Attack",
  },
  player: {
    color: "bg-gray-200",
    icon: "SPV",
    name: "Player",
  },
}

export function GameCard({
  type,
  value,
  isActive,
  isDragging,
  className,
  onClick,
  onDragStart,
  onDragEnd,
}: GameCardProps) {
  const config = cardConfig[type]
  const isPlayerCard = type === "player"
  const isDraggable = !isPlayerCard

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all duration-200",
        !isDragging && "hover:scale-105 hover:z-10",
        isDragging && "opacity-50 scale-95",
        isActive && "ring-2 ring-blue-400 ring-offset-2",
        isDraggable && "hover:shadow-lg",
        className,
      )}
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {isPlayerCard ? (
        // Circular player card
        <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center shadow-lg">
          <span className="text-sm font-bold text-gray-700">{config.icon}</span>
        </div>
      ) : (
        // Rectangular game card
        <div
          className={cn(
            "w-24 h-32 rounded-lg border-2 border-gray-800 shadow-lg flex flex-col items-center justify-between p-2",
            config.color,
          )}
        >
          {/* Card value in top-left */}
          {value && (
            <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-800">{value}</span>
            </div>
          )}

          {/* Card icon/content */}
          <div className="flex-1 flex items-center justify-center">
            <span className="text-2xl">{config.icon}</span>
          </div>

          {/* Card name */}
          <div className="text-xs text-white font-semibold text-center">{config.name}</div>
        </div>
      )}
    </div>
  )
}
