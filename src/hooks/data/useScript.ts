import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../use-toast";
import axiosInstance from "@/config";

export type CreateScriptRequest = {
    keyword: string;
    personalStyle: PersonalStyle;
}

export type PersonalStyle = {
    style: string;
    language: string;
    wordCount: number;
    tone: string;
    perspective: string;
    humor: string;
    quotes: string;
}

const useScript = () => {
    const { toast } = useToast();
    const { isSuccess: isCreatedScript, mutateAsync: createScriptAsync, isPending: isCreatingScript } = useMutation({
        mutationFn: async (data: CreateScriptRequest) => {
            const res = await axiosInstance.post("/script/", {
                keyword: data.keyword,
                style: data.personalStyle.style,
                language: data.personalStyle.language,
                wordCount: data.personalStyle.wordCount,
                tone: data.personalStyle.tone,
                perspective: data.personalStyle.perspective,
                humor: data.personalStyle.humor,
                quotes: data.personalStyle.quotes,
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

    const { isSuccess: isFormattedScript, mutateAsync: formatScriptAsync, isPending: isFormattingScript } = useMutation({
        mutationFn: async (userScript: string) => {
            const res = await axiosInstance.post("/script/format", { script: userScript });
            return res.data.data as string;
        },
        onSuccess: () => {
            toast({
                title: "Format Script",
                description: "Format Script successfully",
            });
        },
        onError: (error) => {
            toast({
                title: "Format Script",
                description: error.message,
            });
        },
    });

    return { isCreatedScript, createScriptAsync, isCreatingScript, isFormattedScript, formatScriptAsync, isFormattingScript };
}

export default useScript;

