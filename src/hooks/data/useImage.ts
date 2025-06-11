import { useMutation } from "@tanstack/react-query";
import { useToast } from "../use-toast";
import axiosInstance from "@/config";

const useImage = () => {
    const { toast } = useToast();

    const { isSuccess: isCreatedImage, mutateAsync: createImagetAsync, isPending: isCreatingImage, data: imageData } = useMutation({
        mutationFn: async ({ script, themes }: { script: string; themes?: string }) => {
            console.log("Sending payload:", { script, themes });
            const res = await axiosInstance.post("/image/", {
                script,
                themes,
            });
            console.log("Image created:", res);
            return res.data;
        },
        onSuccess: (data) => {
            if (data.data.length < data.session_id.split('_').length) {
                toast({
                    title: "Create Image",
                    description: `Generated ${data.data.length} images. Some scenes failed due to rate limits.`,
                });
            } else {
                toast({
                    title: "Create Image",
                    description: "Images created successfully",
                });
            }
        },
        onError: (error: any) => {
            toast({
                title: "Create Image",
                description: error.response?.data?.error || error.message,
                variant: "destructive",
            });
        },
    });

    const { isSuccess: isRegeneratedImage, mutateAsync: regenerateImageAsync, isPending: isRegeneratingImage } = useMutation({
        mutationFn: async ({ image_id, session_id }: { image_id: string; session_id: string }) => {
            console.log("Regenerating image:", { image_id, session_id });
            const res = await axiosInstance.post("/image/regenerate", {
                image_id,
                session_id,
            });
            console.log("Image regenerated:", res);
            return res.data;
        },
        onSuccess: (data) => {
            toast({
                title: "Regenerate Image",
                description: "Image regenerated successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Regenerate Image",
                description: error.response?.data?.error || error.message,
                variant: "destructive",
            });
        },
    });

    return {
        isCreatedImage,
        createImagetAsync,
        isCreatingImage,
        imageData,
        isRegeneratedImage,
        regenerateImageAsync,
        isRegeneratingImage,
    };
}

export default useImage;