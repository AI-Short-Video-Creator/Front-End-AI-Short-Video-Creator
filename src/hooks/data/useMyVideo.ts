import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../use-toast";
import axiosInstance from "@/config";

export type Video = {
    id: string;
    title?: string;
    thumbnail?: string;
    duration?: string;
    date?: string;
    video_path?: string;
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
      const response = await axiosInstance.get("/videos/");
      console.log("Fetched videos:", response.data);
      return (response.data as any[]).map(item => ({
        id: item._id.$oid,
        title: item.title,
        thumbnail: item.thumbnail,
        date: item.created_at.$date,
        video_path: item.video_path,
      })) as Video[];
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
      refetchVideos && refetchVideos();
    },
    onError: () => {
      toast({
        title: "Error deleting video",
        description: "There was an error deleting the video.",
      });
    },
  });

  const {
    mutate: importVideo,
    isPending: isImportingVideo
  } = useMutation({
    mutationFn: async (data: { file: File; title: string; thumbnail?: File }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("title", data.title);
      if (data.thumbnail) {
        formData.append("thumbnail", data.thumbnail);
      }
      await axiosInstance.post("/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Video imported",
        description: "The video has been successfully imported.",
      });
      refetchVideos && refetchVideos();
    },
    onError: () => {
      toast({
        title: "Error importing video",
        description: "There was an error importing the video.",
      });
    },
  });

  return { videos, isLoadingVideos, refetchVideos, deleteVideo, importVideo, isImportingVideo };
}
