import * as React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ShareVideoPreview } from "@/components/share/share-video-preview"
import { Facebook, Youtube, Music } from "lucide-react"
import { toast } from "sonner"

interface ShareVideoDialogProps {
  video: {
    id: string;
    title: string
    thumbnail?: string
  }
  connections: {
    facebook: boolean
    youtube: boolean
    tiktok: boolean
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmShare: (videoId: string, platforms: { facebook: boolean; youtube: boolean; tiktok: boolean; }) => void;
}

export function ShareVideoDialog({ video, connections, open, onOpenChange, onConfirmShare }: ShareVideoDialogProps) {
  const [title, setTitle] = React.useState(video.title)
  const [description, setDescription] = React.useState("")
  const [platforms, setPlatforms] = React.useState({
    facebook: connections.facebook,
    youtube: connections.youtube,
    tiktok: connections.tiktok,
  })

  React.useEffect(() => {
    setTitle(video.title);
    setDescription("");
    setPlatforms({
        facebook: connections.facebook,
        youtube: connections.youtube,
        tiktok: connections.tiktok,
    })
  }, [video, connections])

  const handlePlatformChange = (platform: keyof typeof platforms, checked: boolean) => {
    setPlatforms((prev) => ({ ...prev, [platform]: checked }))
  }

  const handleQuickShare = () => {
    onConfirmShare(video.id, platforms)
  }

  const handleAutoCaption = () => {
    console.log("Generating auto captions...")
    setDescription("This is an auto-generated description for the video.")
    toast.info("Auto captions generated.")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Share Video</DialogTitle>
          <DialogDescription>
            Edit details and select platforms to share your video.
          </DialogDescription>
        </DialogHeader>
        
        {/* Platform Selectors */}
        <div className="space-y-3 py-4">
            <Label className="font-semibold">Select platforms</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {connections.facebook && (
          <div>
            <Checkbox id="facebook" checked={platforms.facebook} onCheckedChange={(checked) => handlePlatformChange("facebook", !!checked)} className="peer sr-only" />
            <Label htmlFor="facebook" className="flex flex-col h-full items-center justify-center gap-2 cursor-pointer rounded-lg border-2 border-muted bg-transparent p-4 transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">
              <img src="/logos/facebook.png" alt="Facebook" className="h-6 w-6" />
              <span className="text-sm font-medium">Facebook</span>
            </Label>
          </div>
              )}
              {connections.youtube && (
          <div>
            <Checkbox id="youtube" checked={platforms.youtube} onCheckedChange={(checked) => handlePlatformChange("youtube", !!checked)} className="peer sr-only" />
            <Label htmlFor="youtube" className="flex flex-col h-full items-center justify-center gap-2 cursor-pointer rounded-lg border-2 border-muted bg-transparent p-4 transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">
              <img src="/logos/youtube.png" alt="YouTube" className="h-6 w-6" />
              <span className="text-sm font-medium">YouTube</span>
            </Label>
          </div>
              )}
              {connections.tiktok && (
          <div>
            <Checkbox id="tiktok" checked={platforms.tiktok} onCheckedChange={(checked) => handlePlatformChange("tiktok", !!checked)} className="peer sr-only" />
            <Label htmlFor="tiktok" className="flex flex-col h-full items-center justify-center gap-2 cursor-pointer rounded-lg border-2 border-muted bg-transparent p-4 transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">
              <img src="/logos/tiktok.png" alt="TikTok" className="h-6 w-6 inline-flex items-center justify-center h-5 w-5 rounded bg-white" />
              <span className="text-sm font-medium">TikTok</span>
            </Label>
          </div>
              )}
            </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <Label>Video preview</Label>
            <div className="mt-2 flex-grow">
              <ShareVideoPreview posterSrc={video.thumbnail} className="h-full" />
            </div>
          </div>
          <div className="space-y-4 flex flex-col">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2 flex flex-col flex-grow">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description for your video..." className="min-h-[150px] md:min-h-[200px] flex-grow" />
              <p className="text-sm text-muted-foreground">
                This description will be shown on the platforms you share to.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 sm:justify-between">
          <Button variant="outline" onClick={handleAutoCaption} className="mt-2 w-full sm:mt-0 sm:w-auto">Generate auto captions</Button>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="ghost" className="w-full sm:w-auto">Cancel</Button>
            </DialogClose>
            <Button onClick={handleQuickShare} className="w-full sm:w-auto">Share now</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}