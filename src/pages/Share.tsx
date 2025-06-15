import * as React from "react";
import { Header } from "@/components/navigation/header";
import { PlatformConnectCard } from "@/components/share/platform-connect-card";
import { Youtube, Facebook, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card-social";
import { VideoCard } from "@/components/ui/video-card-social";
import { ShareVideoDialog } from "@/components/share/share-video-dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const initialMockVideos = [
  { id: 'vid1', title: 'My Awesome First Video', thumbnail: 'https://images.pexels.com/videos/3209828/free-video-3209828.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500', date: 'Jun 10, 2025', duration: '0:45', sharedOn: { facebook: true, youtube: false, tiktok: false } },
  { id: 'vid2', title: 'Mountain Trip', thumbnail: 'https://images.pexels.com/videos/857134/free-video-857134.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500', date: 'Jun 12, 2025', duration: '1:12', sharedOn: { facebook: true, youtube: true, tiktok: false } },
  { id: 'vid3', title: 'Unboxing New Tech', thumbnail: 'https://images.pexels.com/videos/3194248/free-video-3194248.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500', date: 'Jun 14, 2025', duration: '2:30', sharedOn: { facebook: false, youtube: true, tiktok: false } },
  { id: 'vid4', title: 'Quick Cooking Tutorial', thumbnail: 'https://images.pexels.com/videos/3042790/free-video-3042790.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500', date: 'Jun 15, 2025', duration: '0:59', sharedOn: { facebook: false, youtube: false, tiktok: false } },
];

export default function Share() {
  const [connections, setConnections] = React.useState({
    facebook: true,
    youtube: true,
    tiktok: false,
  });

  const mockViews = {
    facebook: 12345,
    youtube: 67890,
    tiktok: 102345,
  }

  const userProfiles = {
    facebook: {
      name: 'John Smith',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
    },
    youtube: {
      name: 'Jane Doe',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d'
    },
    tiktok: {
      name: 'Alex Lee',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d'
    }
  };

  const [videos, setVideos] = React.useState(initialMockVideos);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedVideo, setSelectedVideo] = React.useState<(typeof videos)[0] | null>(null);
  const [videoToDeleteId, setVideoToDeleteId] = React.useState<string | null>(null);

  const handleShareClick = (video: (typeof videos)[0]) => {
    setSelectedVideo(video);
    setDialogOpen(true);
  };

  const handleDeleteClick = (videoId: string) => {
    setVideoToDeleteId(videoId);
  }

  const handleConfirmDelete = () => {
    if (videoToDeleteId) {
      setVideos(prevVideos => prevVideos.filter(video => video.id !== videoToDeleteId));
      toast.success("Video deleted successfully!");
      setVideoToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setVideoToDeleteId(null);
  };

  const handleConnect = (platform: keyof typeof connections) => {
    console.log(`Connecting to ${platform}...`);
    setConnections(prev => ({ ...prev, [platform]: true }));
    toast.success(`Connected to ${platform}!`);
  };

  const handleDisconnect = (platform: keyof typeof connections) => {
    console.log(`Disconnecting from ${platform}...`);
    setConnections(prev => ({ ...prev, [platform]: false }));
    toast.info(`Disconnected from ${platform}.`);
  };

  const handleConfirmShare = (videoId: string, sharedPlatforms: { [key: string]: boolean }) => {
    setVideos(prevVideos =>
      prevVideos.map(video => {
        if (video.id === videoId) {
          const newSharedOn = { ...video.sharedOn };
          for (const platform in sharedPlatforms) {
            if (sharedPlatforms[platform]) {
              newSharedOn[platform as keyof typeof newSharedOn] = true;
            }
          }
          return { ...video, sharedOn: newSharedOn };
        }
        return video;
      })
    );
    setDialogOpen(false);
    toast.success("Video shared successfully!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Share Videos</h1>
          <p className="text-muted-foreground">Connect your social media accounts to start sharing.</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Manage Connections</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <PlatformConnectCard
                platformName="Facebook"
                Icon={() => (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                    alt="Facebook"
                    className="w-6 h-6"
                  />
                )}
                isConnected={connections.facebook}
                onConnect={() => handleConnect("facebook")}
                onDisconnect={() => handleDisconnect("facebook")}
                iconColorClassName=""
                views={mockViews.facebook}
                userName={connections.facebook ? userProfiles.facebook.name : undefined}
                userAvatar={connections.facebook ? userProfiles.facebook.avatar : undefined}
              />
              <PlatformConnectCard
                platformName="YouTube"
                Icon={() => (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png"
                    alt="YouTube"
                    className="w-8 h-6"
                  />
                )}
                isConnected={connections.youtube}
                onConnect={() => handleConnect("youtube")}
                onDisconnect={() => handleDisconnect("youtube")}
                iconColorClassName=""
                views={mockViews.youtube}
                userName={connections.youtube ? userProfiles.youtube.name : undefined}
                userAvatar={connections.youtube ? userProfiles.youtube.avatar : undefined}
              />
              <PlatformConnectCard
                platformName="TikTok"
                Icon={() => (
                  <img
                    src="https://th.bing.com/th/id/OIP.A4g1vsgqXLWCAy-6Eor2OQHaHa?rs=1&pid=ImgDetMain&cb=idpwebpc1"
                    alt="TikTok"
                    className="w-6 h-6 inline-flex items-center justify-center h-5 w-5 rounded bg-white"
                  />
                )}
                isConnected={connections.tiktok}
                onConnect={() => handleConnect("tiktok")}
                onDisconnect={() => handleDisconnect("tiktok")}
                iconColorClassName=""
                views={connections.tiktok ? mockViews.tiktok : undefined}
                userName={connections.tiktok ? userProfiles.tiktok.name : undefined}
                userAvatar={connections.tiktok ? userProfiles.tiktok.avatar : undefined}
              />
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Select a Video to Share</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                title={video.title}
                thumbnail={video.thumbnail}
                date={video.date}
                duration={video.duration}
                onShare={() => handleShareClick(video)}
                onDelete={() => handleDeleteClick(video.id)}
                sharedOn={video.sharedOn}
              />
            ))}
          </div>
        </div>
      </main>
      {selectedVideo && (
        <ShareVideoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          video={selectedVideo}
          connections={connections}
          onConfirmShare={handleConfirmShare}
        />
      )}
      <AlertDialog open={videoToDeleteId !== null} onOpenChange={(open) => !open && setVideoToDeleteId(null)}>
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
  );
}