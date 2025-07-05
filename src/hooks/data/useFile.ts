import { useMutation } from "@tanstack/react-query";
import { useToast } from "../use-toast";
import axiosInstance from "@/config";

const useFile = () => {
    const { toast } = useToast();

    const { isSuccess: isUploadedVideo, mutateAsync: uploadVideoAsync, isPending: isUploadingVideo, data: videoData } = useMutation({
        mutationFn: async (videoFile: Blob) => {
            const formData = new FormData();
            formData.append('video', videoFile, 'export.mp4');
            
            console.log("Uploading video to backend...");
            const res = await axiosInstance.post("/file/video", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("Video uploaded:", res);
            return res.data;
        },
        onSuccess: (data) => {
            toast({
                title: "Upload Video",
                description: "Video uploaded successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Upload Video",
                description: error.response?.data?.error || error.message,
                variant: "destructive",
            });
        },
    });

    const { isSuccess: isUploadedImage, mutateAsync: uploadImageAsync, isPending: isUploadingImage } = useMutation({
        mutationFn: async ({ imageFile, imageId }: { imageFile: Blob; imageId?: string }) => {
            const formData = new FormData();
            formData.append('image', imageFile, imageId || 'image.jpg');
            
            console.log("Uploading image to backend...");
            const res = await axiosInstance.post("/file/images", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("Image uploaded:", res);
            return res.data;
        },
        onSuccess: (data) => {
            toast({
                title: "Upload Image",
                description: "Image uploaded successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Upload Image",
                description: error.response?.data?.error || error.message,
                variant: "destructive",
            });
        },
    });

    return {
        // Video upload
        isUploadedVideo,
        uploadVideoAsync,
        isUploadingVideo,
        videoData,
        
        // Image upload
        isUploadedImage,
        uploadImageAsync,
        isUploadingImage,
    };
}

export default useFile;
