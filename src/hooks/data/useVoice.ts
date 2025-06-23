import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";

export type Voice = {
  voice_name: string;
  language_code: string;
  gender: "MALE" | "FEMALE";
  sample_rate_hertz: string;
  preview_url: string;
};

export type GetVoicesResponse = {
  total_count: number;
  message: string;
  voices: Voice[];
};

export type CloneVoiceResponse = {
  message: string;
  voice_id: string;
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
    mutationFn: async (audioFile: File) => {
      const formData = new FormData();
      formData.append("audio_file", audioFile);

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
      toast({
        title: "Voice Deleted",
        description: data.message || "The voice has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["voices"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.message || "An error occurred.",
        variant: "destructive",
      });
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
