import * as React from "react"
import { VideoCard } from "@/components/ui/video-card-social"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { VideoImportDialog } from "./video-import-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useVideo } from "@/hooks/data/useMyVideo";
import { formatDate } from "date-fns";

interface LibraryGridProps {
  search: string;
}

export function LibraryGrid({ search }: LibraryGridProps) {
  const [videoToDelete, setVideoToDelete] = React.useState<string | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const { importVideo, isImportingVideo, videos, deleteVideo } = useVideo();

  const handleDeleteClick = (id: string) => {
    setVideoToDelete(id);
  }

  const handleConfirmDelete = () => {
    if (videoToDelete !== null) {
      deleteVideo(videoToDelete);
      setVideoToDelete(null);
    }
  }

  const handleCancelDelete = () => {
    setVideoToDelete(null);
  }

  const handleImportVideo = ({ file, title, thumbnail }: { file: File; title: string; thumbnail?: File }) => {
    importVideo({ file, title, thumbnail });
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Videos</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{videos?.length} videos</span>
          <Button onClick={() => setImportOpen(true)} variant="default" size="sm">
            <Plus className="h-4 w-4" />Import
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos?.map((video) => video.title.toLowerCase().includes(search.toLowerCase()) && (
          <VideoCard
            key={video.id}
            title={video.title}
            thumbnail={video.thumbnail}
            date={formatDate(video.date || new Date(), "PPpp")}
            onDelete={() => handleDeleteClick(video.id)}
            videoUrl={video.video_path}
          />
        ))}
      </div>
      <AlertDialog open={videoToDelete !== null} onOpenChange={(open) => !open && setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the video from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VideoImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImportVideo}
        isImporting={isImportingVideo}
      />
    </div>
  )
}
