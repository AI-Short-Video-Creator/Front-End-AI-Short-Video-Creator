import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "../Loading";
import { useEffect } from "react";

type VideoImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (video: { file: File; title: string; thumbnail?: File }) => void;
  isImporting?: boolean;
};

export function VideoImportDialog({ open, onOpenChange, onImport, isImporting }: VideoImportDialogProps) {
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState<File | null>(null);

  const handleImport = () => {
    if (videoFile && title.trim()) {
      onImport({ file: videoFile, title, thumbnail: thumbnail || undefined });
    }
  };

  useEffect(() => {
    if (!isImporting) {
      setVideoFile(null);
      setTitle("");
      setThumbnail(null);
      onOpenChange(false);
    }
  }, [isImporting, onOpenChange]);

  const handleCancel = () => {
    setVideoFile(null);
    setTitle("");
    setThumbnail(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-upload">Video file</Label>
            <Input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={e => setVideoFile(e.target.files?.[0] || null)}
            />
          </div>
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
            <Label htmlFor="thumbnail-upload">Thumbnail</Label>
            <Input
              id="thumbnail-upload"
              type="file"
              accept="image/*"
              onChange={e => setThumbnail(e.target.files?.[0] || null)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!videoFile || !title.trim()}
            style={{ minWidth: 90 }}
          >
            <span className="flex items-center gap-2">
              {isImporting ? <LoadingSpinner /> : "Import"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}