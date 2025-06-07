import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../use-toast";
import axiosInstance from "@/config";

export type CreateScriptRequest = {
    keywords: string[];
    topic: string;
    style?: string;
    language?: string;
    wordCount?: number;
}

const useScript = () => {
    const { toast } = useToast();
    const { isSuccess: isCreatedScript, mutateAsync: createScriptAsync, isPending: isCreatingScript } = useMutation({
        mutationFn: async (data: CreateScriptRequest) => {
            const res = await axiosInstance.post("/script/", {
                keywords: data.keywords,
                topic: data.topic,
                style: data.style,
                language: data.language,
                wordCount: data.wordCount,
            });
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "Create Script",
                description: "Create Script successfully",
            });
        },
        onError: (error) => {
            toast({
                title: "Create Script",
                description: error.message,
            });
        },
    });

    return { isCreatedScript, createScriptAsync, isCreatingScript };
}

export default useScript;

