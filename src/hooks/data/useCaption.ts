import { useState } from 'react';
import axiosInstance from "@/config";
import { useToast } from '@/hooks/use-toast';

interface CaptionResponse {
  title: string;
  caption: string;
}

interface CaptionRequest {
  video_context: string;
  lang?: string;
}

const useCaption = () => {
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const { toast } = useToast();

  const generateCaptionAsync = async (data: CaptionRequest): Promise<CaptionResponse | null> => {
    setIsGeneratingCaption(true);
    try {
      const response = await axiosInstance.get('/caption/social', {
        params: {
          video_context: data.video_context,
          lang: data.lang || 'en'
        }
      });
      
      if (response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error generating caption:', error);
      toast({
        title: "Error",
        description: "Failed to generate title and caption.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  return {
    generateCaptionAsync,
    isGeneratingCaption
  };
};

export default useCaption;
