import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/config";
import { AxiosError } from "axios";

export type GCTTSRequest = {
    provider: 'gctts';
    script: string;
    voice_name: string;
    language_code: string;
    speaking_rate: number;
    pitch: number;
    volume_gain_db: number;
};

export type ElevenLabsRequest = {
    provider: 'elevenlabs';
    script: string;
    voice_id: string;
    stability: number;
    speed: number;
};

export type SynthesisRequest = GCTTSRequest | ElevenLabsRequest;

export type SceneAudioDetail = {
    scene_index: number;
    script: string;
    audio_url: string;
    duration: number;
};

export type MultiSynthesisResponse = {
    message: string;
    total_scenes: number;
    voice_used: string;
    scenes: SceneAudioDetail[];
};

const useAudioSynthesis = () => {
    const { toast } = useToast();

    const { 
        mutateAsync: generateAudio, 
        isPending: isGeneratingAudio,
        data: generatedAudioData,
        error: generationError,
    } = useMutation<
        MultiSynthesisResponse,
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

        const res = await axiosInstance.post<MultiSynthesisResponse>("/voice/synthesis", apiPayload);
        return res.data;
        },
        
        onSuccess: (data) => {
            toast({
                title: "Audio Generated Successfully",
                description: data.message || `Successfully generated audio for ${data.total_scenes} scenes.`,
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
