import type React from "react"
import { cn } from "@/lib/utils"

export type CardType = "attack" | "defence" | "utility" | "player"
export type CardCategory = 
  | "SQL INJECTION" | "DDOS ATTACK" | "RANSOMWARE" | "PHISHING" 
  | "BRUTE FORCE" | "ZERO-DAY" | "WORM" | "ROOTKIT" | "KEYLOGGER" 
  | "FIREWALL" | "DATA VAULT" | "HONEYPOT" | "BACKUP" | "PORT SCANNER" 
  | "MULTI-FACTOR" | "ENCRYPTED" | "SEGMENTATION" | "DECOY SYSTEM" 
  | "PROXY SERVER" | "AUDIT" | "VIRUS SCAN" | "FORCE REBOOT" 
  | "SCAN" | "OVERCLOCK" | "PATCH"

export interface GameCardProps {
  type: CardType
  category: CardCategory
  value?: number
  isActive?: boolean
  isDragging?: boolean
  className?: string
  size?: "small" | "normal" | "large"
  hoverEffect?: boolean
  onClick?: () => void
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
}

// Background images for each category
const categoryBackgrounds: Record<CardCategory, string> = {
  // Attack categories
  "SQL INJECTION": "bg-[url('/SQL_INJECTION.png')]",
  "DDOS ATTACK": "bg-[url('/DDOS.png')]",
  "RANSOMWARE": "bg-[url('/RANSOMWARE.png')]",
  "PHISHING": "bg-[url('/PHISHING.png')]",
  "BRUTE FORCE": "bg-[url('/BRUTE_FORCE.png')]",
  "ZERO-DAY": "bg-[url('/ZERO_DAY.png')]",
  "WORM": "bg-[url('/WORM.png')]",
  "ROOTKIT": "bg-[url('/ROOTKIT.png')]",
  "KEYLOGGER": "bg-[url('/KEYLOGGER.png')]",
  "PORT SCANNER": "bg-[url('/PORT_SCANNER.png')]",
  
  // Defence categories
  "FIREWALL": "bg-[url('/FIREWALL.png')]",
  "DATA VAULT": "bg-[url('/DATA_VAULT.png')]",
  "HONEYPOT": "bg-[url('/HONEYPOT.png')]",
  "BACKUP": "bg-[url('/BACKUP.png')]",
  "MULTI-FACTOR": "bg-[url('/MULTI_FACTOR.png')]",
  "ENCRYPTED": "bg-[url('/ENCRYPTED.png')]",
  "SEGMENTATION": "bg-[url('/SEGMENTATION.png')]",
  "DECOY SYSTEM": "bg-[url('/DECOY_SYSTEM.png')]",
  "PROXY SERVER": "bg-[url('/PROXY_SERVER.png')]",
  "AUDIT": "bg-[url('/AUDIT.png')]",
  
  // Utility categories
  "VIRUS SCAN": "bg-[url('/VIRUS_SCAN.png')]",
  "FORCE REBOOT": "bg-[url('/FORCE_REBOOT.png')]",
  "SCAN": "bg-[url('/SCAN.png)]",
  "OVERCLOCK": "bg-[url('/OVERCLOCK.png')]",
  "PATCH": "bg-[url('/PATCH.png')]",
}

const cardConfig = {
  attack: {
    border: "border-red-400",
    glow: "shadow-red-500/60",
   
    
    overlay: "bg-gradient-to-br from-red-900/70 to-red-800/60"
  },
  defence: {
    border: "border-blue-400",
    glow: "shadow-blue-500/60",
    overlay: "bg-gradient-to-br from-blue-900/70 to-blue-800/60"
  },
  utility: {
    border: "border-purple-400",
    glow: "shadow-purple-500/60",
   

    overlay: "bg-gradient-to-br from-purple-900/70 to-purple-800/60"
  },
  player: {
    gradient: "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300",
    border: "border-gray-400",
    glow: "shadow-gray-400/50",

  },
}

export function GameCard({
  type,
  category,
  value,
  isActive,
  isDragging,
  className,
  size = "normal",
  hoverEffect = true,
  onClick,
  onDragStart,
  onDragEnd,
}: GameCardProps) {
  const config = cardConfig[type]
  const isPlayerCard = type === "player"
  const isDraggable = !isPlayerCard
  const backgroundImage = categoryBackgrounds[category]
  const hoverEffectClass = hoverEffect 
  
  // Size configurations
  const sizeClasses = {
    small: "w-24 h-32",
    normal: "w-37 h-49", 
    large: "w-80 h-115"
  }

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all duration-300 flex justify-center items-center p-1 transform-gpu",
        !isDragging && "hover:scale-105 hover:z-50",
        isDragging && "opacity-70 scale-95 ",
        !hoverEffectClass  &&"hover:scale-100  ",
        
        !hoverEffectClass && isActive &&"hover:scale-100 ring-2 ring-yellow-400 ",
        isActive && hoverEffectClass && "ring-4 ring-yellow-400 ring-offset-2",
        isDraggable && "hover:shadow-2xl",
        className,
      )}
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {isPlayerCard ? (
        // Circular player card
        <div className={cn(
          "w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-xl",
          config.border,
          "hover:" + config.glow
        )}>
        </div>
      ) : (
        // Rectangular cybersecurity card with category-specific background
        <div
          className={cn(
            sizeClasses[size],
            "rounded-xl border-2 shadow-2xl flex flex-col ritems-center justify-between p-3 relative overflow-hidden backdrop-blur-sm",
            backgroundImage,
            config.border,
            "hover:" + config.glow,
            "bg-cover bg-center",
            "before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/20 before:to-transparent before:pointer-events-none"
          )}
        >
        </div>
      )}
    </div>
  )
}