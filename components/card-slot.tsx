import type React from "react"
import { cn } from "@/lib/utils"
import { GameCard, type GameCardProps } from "./game-card"

interface CardSlotProps {
  card?: GameCardProps
  isEmpty?: boolean
  isValidDropTarget?: boolean
  className?: string
  onDrop?: (card: GameCardProps) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
}

export function CardSlot({
  card,
  isEmpty,
  isValidDropTarget,
  className,
  onDrop,
  onDragOver,
  onDragLeave,
}: CardSlotProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    onDragOver?.(e)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const cardData = e.dataTransfer.getData("application/json")
    if (cardData && onDrop) {
      const droppedCard = JSON.parse(cardData)
      onDrop(droppedCard)
    }
  }

  return (
    <div
      className={cn(
        "w-28 h-36 border-2 rounded-xl flex items-center justify-center transition-all duration-300 transform-gpu relative overflow-hidden backdrop-blur-sm",
        isEmpty && "border-dashed border-amber-300/50 bg-gradient-to-br from-amber-50/30 to-yellow-100/30 hover:border-amber-400/70 hover:bg-gradient-to-br hover:from-amber-100/40 hover:to-yellow-200/40",
        !isEmpty && "border-solid border-amber-400/60 bg-gradient-to-br from-amber-100/20 to-yellow-200/20",
        isValidDropTarget && "border-green-400 bg-gradient-to-br from-green-100/40 to-emerald-200/40 border-solid animate-pulse shadow-lg shadow-green-400/30",
        "hover:scale-105 hover:shadow-xl",
        className,
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={onDragLeave}
    >
      {/* Slot background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none rounded-xl"></div>
      
      {card ? (
        <div className="transform hover:scale-105 transition-transform duration-200">
          <GameCard {...card} />
        </div>
      ) : (
        <div className="text-center z-10">
          {isValidDropTarget ? (
            <div className="text-green-600 text-sm font-bold animate-bounce">
              <div className="text-2xl mb-1">⬇️</div>
              <div>Drop Here</div>
            </div>
          ) : (
            <div className="text-amber-600/60 text-xs font-medium">
              <div className="text-lg mb-1 opacity-50">◯</div>
              <div>Empty Slot</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
