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
        "w-24 h-32 border-2 rounded-lg flex items-center justify-center transition-all duration-200",
        isEmpty && "border-dashed border-gray-400 bg-gray-50",
        !isEmpty && "border-solid border-gray-300",
        isValidDropTarget && "border-green-400 bg-green-50 border-solid",
        className,
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={onDragLeave}
    >
      {card ? (
        <GameCard {...card} />
      ) : (
        <div className="text-gray-400 text-xs text-center">{isValidDropTarget ? "Drop Here" : "Empty Slot"}</div>
      )}
    </div>
  )
}
