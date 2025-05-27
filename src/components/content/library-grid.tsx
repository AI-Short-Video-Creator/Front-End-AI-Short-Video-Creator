import * as React from "react"
import { VideoCard } from "@/components/ui/video-card"
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

// Mock video data
const initialVideos = [
  {
    id: 1,
    title: "AI trends in 2025",
    thumbnail: "https://i.ytimg.com/vi/h8-qemIbXbo/maxresdefault.jpg",
    duration: "0:45",
    date: "April 21, 2025",
    url: "https://res.cloudinary.com/du7gb47mh/video/upload/kllynt7byxrplhq6g7q9.mp4"
  },
  {
    id: 2,
    title: "Sustainable living tips",
    thumbnail: "https://i.ytimg.com/vi/h8-qemIbXbo/maxresdefault.jpg",
    duration: "0:32",
    date: "April 19, 2025",
    url: "https://res.cloudinary.com/du7gb47mh/video/upload/kllynt7byxrplhq6g7q9.mp4"
  },
  {
    id: 3,
    title: "Mental health awareness",
    thumbnail: "https://i.ytimg.com/vi/h8-qemIbXbo/maxresdefault.jpg",
    duration: "0:58",
    date: "April 15, 2025",
    url: "https://res.cloudinary.com/du7gb47mh/video/upload/kllynt7byxrplhq6g7q9.mp4"
  },
  {
    id: 4,
    title: "Future of remote work",
    thumbnail: "https://i.ytimg.com/vi/h8-qemIbXbo/maxresdefault.jpg",
    duration: "0:36",
    date: "April 10, 2025",
    url: "https://res.cloudinary.com/du7gb47mh/video/upload/kllynt7byxrplhq6g7q9.mp4"
  },
  {
    id: 5,
    title: "Tech gadgets review",
    thumbnail: "https://i.ytimg.com/vi/h8-qemIbXbo/maxresdefault.jpg",
    duration: "0:42",
    date: "April 5, 2025",
    url: "https://res.cloudinary.com/du7gb47mh/video/upload/kllynt7byxrplhq6g7q9.mp4"
  },
  {
    id: 6,
    title: "Easy recipes for beginners",
    thumbnail: "https://i.ytimg.com/vi/h8-qemIbXbo/maxresdefault.jpg",
    duration: "0:39",
    date: "April 1, 2025",
    url: "https://res.cloudinary.com/du7gb47mh/video/upload/kllynt7byxrplhq6g7q9.mp4"
  }
]

export function LibraryGrid() {
  const [videos, setVideos] = React.useState(initialVideos);
  const [videoToDelete, setVideoToDelete] = React.useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setVideoToDelete(id);
  }
  
  const handleConfirmDelete = () => {
    if (videoToDelete !== null) {
      console.log("Deleting video", videoToDelete);
      setVideos(videos.filter(video => video.id !== videoToDelete));
      setVideoToDelete(null);
    }
  }

  const handleCancelDelete = () => {
    setVideoToDelete(null);
  }

  const handleDownload = (id: number) => {
    const video = videos.find(v => v.id === id);
    if (video && video.url) {
      const filename = `${video.title.replace(/\s+/g, "_")}.mp4`;
      const link = document.createElement("a");
      link.href = video.url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("Downloading:", filename);
    }
  }
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Videos</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{videos.length} videos</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            title={video.title}
            thumbnail={video.thumbnail}
            duration={video.duration}
            date={video.date}
            url={video.url}
            onDelete={() => handleDeleteClick(video.id)}
            onDownload={() => handleDownload(video.id)}
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
    </div>
  )
}
