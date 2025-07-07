import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "../Loading";
import { useEffect } from "react";
import { Video } from "@/hooks/data/useMyVideo";

type VideoEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: { videoId: string; title?: string; thumbnail?: File }) => void;
  isUpdating?: boolean;
  video: Video | null;
};

export function VideoEditDialog({ open, onOpenChange, onUpdate, isUpdating, video }: VideoEditDialogProps) {
  const [title, setTitle] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState<File | null>(null);

  // Load video data when dialog opens or video changes
  useEffect(() => {
    if (video) {
      setTitle(video.title || "");
      setThumbnail(null); // Reset thumbnail file input
    }
  }, [video]);

  const handleUpdate = () => {
    if (video && video.id) {
      const updateData: { videoId: string; title?: string; thumbnail?: File } = {
        videoId: video.id,
      };
      
      // Only include title if it's different from original
      if (title.trim() !== video.title) {
        updateData.title = title.trim();
      }
      
      // Only include thumbnail if a new one was selected
      if (thumbnail) {
        updateData.thumbnail = thumbnail;
      }
      
      onUpdate(updateData);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setThumbnail(null);
    }
  }, [open]);

  const handleCancel = () => {
    if (video) {
      setTitle(video.title || "");
    }
    setThumbnail(null);
    onOpenChange(false);
  };

  const hasChanges = () => {
    if (!video) return false;
    return title.trim() !== video.title || thumbnail !== null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Current thumbnail preview */}
          {video && video.thumbnail && (
            <div className="space-y-2">
              <Label>Current Thumbnail</Label>
              <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt="Current thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="video-title">Title</Label>
            <Input
              id="video-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter video title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="thumbnail-upload">New Thumbnail (optional)</Label>
            <Input
              id="thumbnail-upload"
              type="file"
              accept="image/*"
              onChange={e => setThumbnail(e.target.files?.[0] || null)}
            />
            {thumbnail && (
              <p className="text-sm text-gray-600">
                Selected: {thumbnail.name}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!title.trim() || !hasChanges() || isUpdating}
            style={{ minWidth: 90 }}
          >
            <span className="flex items-center gap-2">
              {isUpdating ? <LoadingSpinner /> : "Update"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}