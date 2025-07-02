import { useMutation } from "@tanstack/react-query";
import { useToast } from "../use-toast";
import axiosInstance from "@/config";

const useVideo = () => {
    const { toast } = useToast();

    const { isSuccess: isCreatedVideo, mutateAsync: createVideoAsync, isPending: isCreatingVideo } = useMutation({
        mutationFn: async ({ image_urls, voices }: { image_urls: string[]; voices: string[] }) => {
            console.log("Sending video payload:", { image_urls, voices });
            const res = await axiosInstance.post("/video/", {
                image_urls,
                voices,
                add_captions: true,
                add_transitions: true
            });
            console.log("Video created:", res);
            return res.data;
        },
        onSuccess: (data) => {
            toast({
                title: "Create Video",
                description: "Video created successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Create Video",
                description: error.response?.data?.error || error.message,
                variant: "destructive",
            });
        },
    });

    return {
        isCreatedVideo,
        createVideoAsync,
        isCreatingVideo
    };
}

export default useVideo;