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
    gradient: "bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800",
    border: "border-blue-300",
    glow: "shadow-blue-500/50",
    icon: "🗄️",
    name: "Database",
  },
  firewall: {
    gradient: "bg-gradient-to-br from-red-400 via-red-600 to-red-800",
    border: "border-red-300",
    glow: "shadow-red-500/50",
    icon: "🛡️",
    name: "Firewall",
  },
  scanner: {
    gradient: "bg-gradient-to-br from-purple-400 via-purple-600 to-purple-800",
    border: "border-purple-300",
    glow: "shadow-purple-500/50",
    icon: "🔍",
    name: "Scanner",
  },
  shield: {
    gradient: "bg-gradient-to-br from-green-400 via-green-600 to-green-800",
    border: "border-green-300",
    glow: "shadow-green-500/50",
    icon: "⚡",
    name: "Shield",
  },
  attack: {
    gradient: "bg-gradient-to-br from-orange-400 via-orange-600 to-orange-800",
    border: "border-orange-300",
    glow: "shadow-orange-500/50",
    icon: "⚔️",
    name: "Attack",
  },
  player: {
    gradient: "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300",
    border: "border-gray-400",
    glow: "shadow-gray-400/50",
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
        "relative cursor-pointer transition-all duration-300 transform-gpu",
        !isDragging && "hover:scale-110 hover:z-50 hover:-translate-y-1",
        isDragging && "opacity-50 scale-95",
        isActive && "ring-4 ring-yellow-400 ring-offset-2 scale-105",
        isDraggable && "hover:shadow-2xl",
        className,
      )}
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {isPlayerCard ? (
        // Circular player card with modern styling
        <div className={cn(
          "w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-xl backdrop-blur-sm",
          config.gradient,
          config.border,
          "hover:" + config.glow
        )}>
          <span className="text-sm font-bold text-gray-800 drop-shadow-sm">{config.icon}</span>
        </div>
      ) : (
        // Rectangular game card with 3D effect
        <div
          className={cn(
            "w-28 h-36 rounded-xl border-2 shadow-2xl flex flex-col items-center justify-between p-3 relative overflow-hidden backdrop-blur-sm",
            config.gradient,
            config.border,
            "hover:" + config.glow,
            "before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/20 before:to-transparent before:pointer-events-none"
          )}
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
          
          {/* Card value in top-left with modern styling */}
          {value && (
            <div className="absolute top-2 left-2 w-7 h-7 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-lg border border-gray-200 z-10">
              <span className="text-sm font-bold text-gray-800">{value}</span>
            </div>
          )}

          {/* Card icon/content with glow */}
          <div className="flex-1 flex items-center justify-center z-10">
            <span className="text-3xl drop-shadow-lg filter brightness-110">{config.icon}</span>
          </div>

          {/* Card name with better typography */}
          <div className="text-sm text-white font-bold text-center drop-shadow-lg z-10 bg-black/20 px-2 py-1 rounded-md backdrop-blur-sm">
            {config.name}
          </div>
        </div>
      )}
    </div>
  )
}
