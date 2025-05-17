
import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Play, Trash2 } from "lucide-react"

interface VideoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  thumbnail?: string
  duration?: string
  date?: string
  onPlay?: () => void
  onDelete?: () => void
  onDownload?: () => void
}

export function VideoCard({ 
  title,
  thumbnail,
  duration,
  date,
  onPlay,
  onDelete,
  onDownload,
  className, 
  ...props 
}: VideoCardProps) {
  return (
    <Card 
      className={cn(
        "border border-border/40 bg-white shadow-sm overflow-hidden",
        className
      )} 
      {...props}
    >
      <div className="relative video-container bg-gray-100">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-creative-50">
            <span className="text-creative-300">No Preview</span>
          </div>
        )}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
            {duration}
          </div>
        )}
        <Button 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50 h-10 w-10"
          size="icon"
          variant="ghost"
          onClick={onPlay}
        >
          <Play fill="white" className="ml-0.5" />
        </Button>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm truncate mb-1">{title}</h3>
        {date && <p className="text-xs text-muted-foreground mb-2">{date}</p>}
        <div className="flex gap-2 justify-end">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 text-xs px-2"
            onClick={onDelete}
          >
            <Trash2 size={12} className="mr-1" /> Delete
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 text-xs px-2"
            onClick={onDownload}
          >
            <Download size={12} className="mr-1" /> Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
