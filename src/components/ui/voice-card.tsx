
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Play } from "lucide-react"

interface VoiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  language: string
  gender: string
  isSelected?: boolean
  onPlay?: () => void
  onSelect?: () => void
}

export function VoiceCard({ 
  name, 
  language, 
  gender,
  isSelected = false,
  onPlay,
  onSelect,
  className, 
  ...props 
}: VoiceCardProps) {
  return (
    <Card 
      className={cn(
        "relative border transition-all cursor-pointer", 
        isSelected ? "border-creative-500 bg-creative-50" : "border-border/40 hover:border-creative-200",
        className
      )} 
      onClick={onSelect}
      {...props}
    >
      {isSelected && (
        <span className="absolute top-2 right-2 h-5 w-5 bg-creative-500 rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" />
        </span>
      )}
      <CardContent className="p-4 flex justify-between items-start">
        <div>
          <h3 className="font-medium">{name}</h3>
          <div className="flex gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{language}</span>
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{gender}</span>
          </div>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 rounded-full hover:bg-creative-100 hover:text-creative-600"
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
        >
          <Play size={16} />
        </Button>
      </CardContent>
    </Card>
  )
}
