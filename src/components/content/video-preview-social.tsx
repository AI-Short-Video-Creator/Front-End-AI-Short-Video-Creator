
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Download, Edit, Play } from "lucide-react"

interface VideoPreviewProps {
  videoSrc?: string
  posterSrc?: string
  onEdit?: () => void
  onDownload?: () => void
}

export function VideoPreview({ 
  videoSrc, 
  posterSrc,
  onEdit, 
  onDownload 
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  
  // Mock video preview
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Preview</h2>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative video-container bg-gray-100 max-w-[300px] w-full border border-border rounded-lg overflow-hidden">
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center">
              {posterSrc ? (
                <img src={posterSrc} alt="Video preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-creative-50">
                  <span className="text-creative-300">Video Preview</span>
                </div>
              )}
              <Button 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50 h-10 w-10"
                size="icon"
                variant="ghost"
                onClick={() => setIsPlaying(true)}
              >
                <Play fill="white" className="ml-0.5" />
              </Button>
            </div>
          )}
          {isPlaying && videoSrc && (
            <video 
              src={videoSrc} 
              controls 
              autoPlay 
              className="w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
            />
          )}
          {isPlaying && !videoSrc && (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <span className="text-white">Video simulation</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium">Your video is ready!</h3>
          <p className="text-muted-foreground">
            Your AI-generated short video has been created and is ready to be shared.
          </p>
        </div>
      </div>
    </div>
  )
}
