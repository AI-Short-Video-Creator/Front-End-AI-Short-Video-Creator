import * as React from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShareVideoPreviewProps {
  posterSrc?: string
  videoSrc?: string
  className?: string
}

export function ShareVideoPreview({ posterSrc, videoSrc, className }: ShareVideoPreviewProps) {
  const [showVideo, setShowVideo] = React.useState(false)

  return (
    <div className={cn("relative bg-muted rounded-lg overflow-hidden border border-border", className)}>
      {showVideo && videoSrc ? (
        <video
          src={videoSrc}
          controls
          autoPlay
          className="w-full h-full object-cover"
          poster={posterSrc}
        />
      ) : posterSrc ? (
        <div className="relative w-full h-full cursor-pointer" onClick={() => setShowVideo(true)}>
          <img src={posterSrc} alt="Video preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Button
              className="rounded-full bg-black/40 hover:bg-black/60 h-12 w-12"
              size="icon"
              variant="ghost"
              aria-label="Play video preview"
              onClick={e => {
                e.stopPropagation()
                setShowVideo(true)
              }}
            >
              <Play fill="white" className="ml-1 h-6 w-6" />
            </Button>
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground">No preview available</span>
      )}
    </div>
  )
}