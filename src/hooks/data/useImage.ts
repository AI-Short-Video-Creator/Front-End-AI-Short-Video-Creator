import { useMutation } from "@tanstack/react-query";
import { useToast } from "../use-toast";
import axiosInstance from "@/config";

const useImage = () => {
    const { toast } = useToast();

    const { isSuccess: isCreatedImage, mutateAsync: createImagetAsync, isPending: isCreatingImage } = useMutation({
        mutationFn: async (data: string) => {
            const res = await axiosInstance.post("/image/", {
                script: data,
            });
            console.log("Image created:", res);
            return res.data;
        },
        onSuccess: (data) => {
            toast({
                title: "Create Image",
                description: "Images created successfully",
            });
        },
        onError: (error) => {
            toast({
                title: "Create Image",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const { isSuccess: isRegeneratedImage, mutateAsync: regenerateImageAsync, isPending: isRegeneratingImage } = useMutation({
        mutationFn: async ({ image_id, session_id }: { image_id: string; session_id: string }) => {
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
        onError: (error) => {
            toast({
                title: "Regenerate Image",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return {
        isCreatedImage,
        createImagetAsync,
        isCreatingImage,
        isRegeneratedImage,
        regenerateImageAsync,
        isRegeneratingImage,
    };
}

export default useImage;