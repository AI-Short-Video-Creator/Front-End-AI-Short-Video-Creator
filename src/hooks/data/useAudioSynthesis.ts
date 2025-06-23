import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/config";
import { AxiosError } from "axios";

export type GCTTSRequest = {
    provider: 'gctts';
    text: string;
    voice_name: string;
    language_code: string;
    speaking_rate: number;
    pitch: number;
    volume_gain_db: number;
};

export type ElevenLabsRequest = {
    provider: 'elevenlabs';
    text: string;
    voice_id: string;
    stability: number;
    speed: number;
};

export type SynthesisRequest = GCTTSRequest | ElevenLabsRequest;

export type SynthesisResponse = {
    message: string;
    audio_path: string;
    filename: string;
    voice_used: string;
}

const useAudioSynthesis = () => {
    const { toast } = useToast();

    const { 
        mutateAsync: generateAudio, 
        isPending: isGeneratingAudio,
        data: generatedAudioData,
        error: generationError,
    } = useMutation<
        SynthesisResponse,
        AxiosError<{ message?: string }>,
        SynthesisRequest
    >({
        mutationFn: async (payload: SynthesisRequest) => {
        let apiPayload: any = { ...payload };

        if (payload.provider === "gctts") {
            apiPayload = {
            ...payload,
            speaking_rate: payload.speaking_rate.toString(),
            pitch: payload.pitch.toString(),
            volume_gain_db: payload.volume_gain_db.toString(),
            };
        } else if (payload.provider === "elevenlabs") {
            apiPayload = {
            ...payload,
            stability: payload.stability.toString(),
            speed: payload.speed.toString(),
            };
        }

        const res = await axiosInstance.post<SynthesisResponse>("/voice/synthesis", apiPayload);
        return res.data;
        },
        
        onSuccess: (data) => {
            toast({
                title: "Audio Generated Successfully",
                description: data.message || `File ${data.filename} has been created.`,
            });
        },

        onError: (error) => {
            const errorMessage = error.response?.data?.message || "Failed to generate audio.";
            toast({
                title: "Audio Generation Failed",
                description: errorMessage,
                variant: "destructive",
            });
        },
    });

    return {
        generateAudio,
        isGeneratingAudio,
        generatedAudioData,
        generationError,
    };
};

export default useAudioSynthesis;
