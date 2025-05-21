import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../use-toast";
import axiosInstance from "@/config";

export type Video = {
    id: string;
    title?: string;
    thumbnail?: string;
    duration?: string;
    date?: string;
    url?: string;
}

export function useVideo() {
  const { toast } = useToast();

  const {
    data: videos,
    isLoading: isLoadingVideos,
    refetch: refetchVideos,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const response = await axiosInstance.get("/videos");
      return (response.data as Video[]) || [];
    },
  });

  const {
    mutate: deleteVideo,
  } = useMutation({
    mutationFn: async (videoId: string) => {
      await axiosInstance.delete(`/videos/${videoId}`);
    },
    onSuccess: () => {
      toast({
        title: "Video deleted",
        description: "The video has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error deleting video",
        description: "There was an error deleting the video.",
      });
    },
  });

  return { videos, isLoadingVideos, refetchVideos, deleteVideo };
}
