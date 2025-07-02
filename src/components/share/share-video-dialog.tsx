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
import { postVideoToPageWithThumbnail } from "@/lib/facebook-insights";
import { uploadVideoToYouTubeViaBackend } from "@/lib/youtube-insights";
import { uploadVideoToTiktokByUrl } from "@/lib/tiktok-insights";
const API_CAPTION_URL = import.meta.env.VITE_PUBLIC_API_URL + "/caption/social" as string;

interface ShareVideoDialogProps {
  video: {
    id: string;
    title: string
    thumbnail?: string
    videoUrl?: string
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
  const [sharing, setSharing] = React.useState(false);
  const [statusText, setStatusText] = React.useState<string | null>(null);
  const [generatingCaption, setGeneratingCaption] = React.useState(false);
  const [language, setLanguage] = React.useState("en");

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

  const handleQuickShare = async () => {
    setSharing(true);
    try {

      const VITE_PUBLIC_API_URL = import.meta.env.VITE_PUBLIC_API_URL;

      // Helper to update social link in backend
      const updateSocialLink = async (platform: string, link: string) => {
        try {
          await fetch(`${VITE_PUBLIC_API_URL}/social/share`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: video.id,
              platform,
              link,
            }),
          });
        } catch (err) {
          console.error(`Failed to update ${platform} link:`, err);
          return;
        }
      };

      // Facebook
      if (platforms.facebook) {
        if (!video.videoUrl) {
          toast.error("No video URL found for sharing to Facebook.");
        }
        try {
          const fbRes = await postVideoToPageWithThumbnail(video.videoUrl, title, description, video.thumbnail);
          toast.success("Video shared to Facebook page successfully!");
          let fbLink = "";
          if (fbRes && typeof fbRes === "object" && fbRes.permalink_url) {
            fbLink = fbRes.permalink_url;
          } else if (fbRes && typeof fbRes === "string") {
            fbLink = fbRes;
          }
          if (fbLink) {
            await updateSocialLink("facebook", fbLink);
          }
        } catch (err: any) {
          toast.error("Failed to share video to Facebook page.");
          return;
        }
      }

      // YouTube
      if (platforms.youtube) {
        if (!video.videoUrl) {
          toast.error("No video URL found for sharing to Youtube.");
        }
        try {
          const ytRes = await uploadVideoToYouTubeViaBackend(video.videoUrl, title, description, video.thumbnail);
          toast.success("Video shared to Youtube channel successfully!");
          let ytLink = "";
          if (ytRes && typeof ytRes === "object" && ytRes.videoUrl) {
            ytLink = ytRes.videoUrl;
          } else if (ytRes && typeof ytRes === "string") {
            ytLink = ytRes;
          }
          if (ytLink) {
            await updateSocialLink("youtube", ytLink);
          }
        } catch (err: any) {
          toast.error("Failed to share video to Youtube channel.");
          return;
        }
      }

      // TikTok
      if (platforms.tiktok) {
        if (!video.videoUrl) {
          toast.error("No video URL found for sharing to TikTok.");
        }
        try {
          const tiktokRes = await uploadVideoToTiktokByUrl(video.videoUrl, title, description);
          toast.success("Video shared to TikTok successfully!");
          let tiktokLink = "";
          if (tiktokRes && typeof tiktokRes === "object" && tiktokRes.publish_id) {
            tiktokLink = "https://www.tiktok.com/@kaytlyntruong28/video/" + tiktokRes.publish_id;
          } else if (tiktokRes && typeof tiktokRes === "string") {
            tiktokLink = tiktokRes;
          }
          if (tiktokLink) {
            await updateSocialLink("tiktok", tiktokLink);
          }
        } catch (err: any) {
          toast.error("Failed to share video to TikTok.");
          return;
        }
      }
      
      onConfirmShare(video.id, platforms);

      setSharing(false);
      onOpenChange(false); // Đóng dialog
    } catch (err) {
      setSharing(false);
      // Không đóng popup
    }
  }

  const handleAutoCaption = async () => {
    setGeneratingCaption(true);
    try {
      setStatusText(null);
      const url = `${API_CAPTION_URL}?video_context=${encodeURIComponent(title)}&lang=${language}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch caption");
      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.caption) setDescription(data.caption);
      toast.success("Auto captions generated.");
    } catch (err) {
      toast.error("Auto caption error.");
      console.error("Auto caption error:", err);
    } finally {
      setGeneratingCaption(false);
    }
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

        {statusText && (
          <div className="text-center text-primary font-semibold py-2">{statusText}</div>
        )}

        <DialogFooter className="pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side: Auto caption & language */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              onClick={handleAutoCaption}
              className="w-full sm:w-auto"
              disabled={sharing || generatingCaption}
            >
              {generatingCaption ? "Generating..." : "Generate auto captions"}
            </Button>
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Label htmlFor="language" className="font-semibold">Language</Label>
              <select
                id="language"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-black text-white"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
                <option value="ru">Russian</option>
              </select>
            </div>
          </div>
          {/* Right side: Action buttons */}
          <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="ghost" className="w-full sm:w-auto">
          Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleQuickShare}
              className="w-full sm:w-auto"
              disabled={sharing || generatingCaption}
            >
              {sharing ? "Sharing..." : "Share now"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}