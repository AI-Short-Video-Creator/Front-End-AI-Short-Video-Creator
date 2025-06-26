import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";

type Voice = {
  voice_name: string;
  language_code: string;
  gender: "MALE" | "FEMALE";
  sample_rate_hertz: string;
  preview_url: string;
};

type GetVoicesResponse = {
  total_count: number;
  message: string;
  voices: Voice[];
};

type CloneVoiceRequest = {
  audio_file: File;
  voice_name: string;
  preview_script: string;
}

type CloneVoiceResponse = {
  message: string;
  voice_id: string;
  preview_url: string;
};

const useVoice = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const useGetVoices = (languageCode: string) => {
    return useQuery<GetVoicesResponse, AxiosError>({
      queryKey: ["voices", languageCode],
      queryFn: async () => {
        const res = await axiosInstance.get<GetVoicesResponse>("/voice", {
          params: { language_code: languageCode },
        });
        return res.data;
      },
      enabled: !!languageCode,
    });
  };

  const { mutateAsync: cloneVoice, isPending: isCloningVoice } = useMutation({
    mutationFn: async (cloneVoiceRequest: CloneVoiceRequest) => {
      const formData = new FormData();
      formData.append("audio_file", cloneVoiceRequest.audio_file);
      formData.append("voice_name", cloneVoiceRequest.voice_name);
      formData.append("preview_script", cloneVoiceRequest.preview_script);

      const res = await axiosInstance.post<CloneVoiceResponse>(
        "/voice/clones",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Voice Cloned",
        description: data.message || "New voice created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["voices"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast({
        title: "Cloning Failed",
        description: error.response?.data?.message || "An error occurred.",
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: deleteVoice } = useMutation({
    mutationFn: async (voiceId: string) => {
      const res = await axiosInstance.delete(`/voice/clones/${voiceId}`);
      return res.data;
    },
    onSuccess: (data: { message?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["voices"] });
    },
  });

  return {
    useGetVoices,
    cloneVoice,
    isCloningVoice,
    deleteVoice,
  };
};

export default useVoice;
