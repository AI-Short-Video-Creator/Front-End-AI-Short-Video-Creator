import * as React from "react";
import { Header } from "@/components/navigation/header";
import { PlatformConnectCard } from "@/components/share/platform-connect-card";
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

import { connectToFacebook } from "@/lib/oauth-flow";
import { fetchTotalVideoViewsForPage } from "@/lib/facebook-insights";
import { ChartNoAxesColumnDecreasingIcon } from "lucide-react";

// Replace the mock video links with your real video links here.
// Example:
const initialMockVideos = [
  {
    id: 'vid1',
    title: 'My Awesome First Video',
    thumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    date: 'Jun 10, 2025',
    sharedOn: { facebook: true, youtube: false, tiktok: false },
    videoUrl: 'https://res.cloudinary.com/create-video-ai/video/upload/v1749640312/user_videos/videos/video_2aab1596-7c29-4b0a-859b-1831b577725d.mp4'
  },
  {
    id: 'vid2',
    title: 'Mountain Trip',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    date: 'Jun 12, 2025',
    sharedOn: { facebook: true, youtube: true, tiktok: false },
    videoUrl: 'https://res.cloudinary.com/create-video-ai/video/upload/v1749640312/user_videos/videos/video_2aab1596-7c29-4b0a-859b-1831b577725d.mp4'
  },
  {
    id: 'vid3',
    title: 'Unboxing New Tech',
    thumbnail: 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7',
    date: 'Jun 14, 2025',
    sharedOn: { facebook: false, youtube: true, tiktok: false },
    videoUrl: 'https://res.cloudinary.com/create-video-ai/video/upload/v1749640312/user_videos/videos/video_2aab1596-7c29-4b0a-859b-1831b577725d.mp4'
  },
  {
    id: 'vid4',
    title: 'Quick Cooking Tutorial',
    thumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    date: 'Jun 15, 2025',
    sharedOn: { facebook: false, youtube: false, tiktok: false },
    videoUrl: 'https://res.cloudinary.com/create-video-ai/video/upload/v1749640312/user_videos/videos/video_2aab1596-7c29-4b0a-859b-1831b577725d.mp4'
  }
];

export default function Share() {
  const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

  const [connections, setConnections] = React.useState({
    facebook: false,
    youtube: false,
    tiktok: false,
  });

  const [facebookProfile, setFacebookProfile] = React.useState<{ name: string; avatar: string } | null>(null);
  const [facebookTotalViews, setFacebookTotalViews] = React.useState<number | null>(null);

  const TotalViews = {
    facebook: 0,
    youtube: 67890,
    tiktok: 102345,
  }

  const userProfiles = {
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

  React.useEffect(() => {
    const fbToken = localStorage.getItem("fb_access_token");
    const fbName = localStorage.getItem("fb_user_name");
    const fbAvatar = localStorage.getItem("fb_user_avatar");
    if (fbToken && fbName && fbAvatar) {
      setConnections((prev) => ({ ...prev, facebook: true }));
      setFacebookProfile({ name: fbName, avatar: fbAvatar });
      fetchTotalVideoViewsForPage().then(setFacebookTotalViews).catch(() => setFacebookTotalViews(0));
      console.log("TotalViews: ", facebookTotalViews);
    }
  }, []);

  React.useEffect(() => {
    if (facebookTotalViews !== null) {
      console.log("TotalViews: ", facebookTotalViews);
    }
  }, [facebookTotalViews]);

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

  const handleConnectFacebook = () => {
    connectToFacebook(FACEBOOK_APP_ID, (user) => {
      setConnections((prev) => ({ ...prev, facebook: true }));
      setFacebookProfile({ name: user.name, avatar: user.avatar });
      toast.success(`Connected to Facebook as ${user.name}`);
    });
  };

  const handleDisconnect = (platform: string) => {
    setConnections((prev) => ({ ...prev, [platform]: false }));
    if (platform === "facebook") {
      setFacebookProfile(null);
      localStorage.removeItem("fb_access_token");
      localStorage.removeItem("fb_user_name");
      localStorage.removeItem("fb_user_avatar");
    }
    // Xử lý cho các nền tảng khác nếu cần
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
                onConnect={handleConnectFacebook}
                onDisconnect={() => handleDisconnect("facebook")}
                iconColorClassName="text-blue-600"
                views={connections.facebook ? facebookTotalViews ?? undefined : undefined}
                userName={connections.facebook && facebookProfile ? facebookProfile.name : undefined}
                userAvatar={connections.facebook && facebookProfile ? facebookProfile.avatar : undefined}
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
                views={TotalViews.youtube}
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
                views={connections.tiktok ? TotalViews.tiktok : undefined}
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
                onShare={() => handleShareClick(video)}
                onDelete={() => handleDeleteClick(video.id)}
                sharedOn={video.sharedOn}
                videoUrl={video.videoUrl}
              >
                {video.videoUrl ? (
                  <video
                    className="w-full h-auto rounded-lg"
                    controls
                    src={video.videoUrl}
                    poster={video.thumbnail}
                  />
                ) : (
                  <img
                    className="w-full h-auto rounded-lg"
                    src={video.thumbnail}
                    alt={video.title}
                  />
                )}
              </VideoCard>
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