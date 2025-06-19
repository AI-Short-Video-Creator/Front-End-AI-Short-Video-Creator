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
  url?: string
  onPlay?: () => void
  onDelete?: () => void
  onDownload?: () => void
}

export function VideoCard({ 
  title,
  thumbnail,
  duration,
  date,
  url,
  onPlay,
  onDelete,
  onDownload,
  className, 
  ...props 
}: VideoCardProps) {
  const [showPlayer, setShowPlayer] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const handlePlay = () => {
    if (url) {
      setShowPlayer(true);
      setTimeout(() => {
        videoRef.current?.play();
      }, 100);
    } else if (onPlay) {
      onPlay();
    }
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    videoRef.current?.pause();
    videoRef.current?.currentTime && (videoRef.current.currentTime = 0);
  };

  const handleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <Card 
      className={cn(
        "border border-border/40 bg-white shadow-sm overflow-hidden flex flex-col w-full max-w-2xl",
        className
      )} 
      {...props}
    >
      {/* Thumbnail/video section */}
      <div className="relative bg-gray-100 aspect-[16/9] w-full">
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
          onClick={handlePlay}
        >
          <Play fill="white" className="ml-0.5" />
        </Button>
      </div>
      {/* Title, date, menu section */}
      <CardContent className="p-3 flex flex-row items-center w-full gap-2">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-row items-center gap-2">
            <h3 className="font-semibold text-base text-creative-300 truncate flex-1" title={title}>{title}</h3>
            <Button size="icon" variant="ghost" onClick={onDownload}>
              <Download size={18} className="text-blue-500" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete}>
              <Trash2 size={18} className="text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
      {showPlayer && url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-3xl h-[60vh] flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              src={url}
              controls
              className="w-full h-full bg-black rounded-lg"
              style={{ maxHeight: '60vh' }}
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button size="icon" variant="ghost" onClick={handleFullScreen}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 8V4h4m8 0h4v4m0 8v4h-4m-8 0H4v-4"/></svg>
              </Button>
              <Button size="icon" variant="ghost" onClick={handleClosePlayer}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 6l12 12M6 18L18 6"/></svg>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
