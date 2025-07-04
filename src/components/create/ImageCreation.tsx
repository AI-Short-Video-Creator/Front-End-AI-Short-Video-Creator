import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VoiceSelection } from "@/components/content/voice-selection";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import useImage from "@/hooks/data/useImage";
import { useToast } from "@/hooks/use-toast";

interface ImageCreationProps {
  selectedVoice: number | null;
  handleBack: () => void;
  handleSelectVoice: (voiceId: number) => void;
  // handleCreateVideo: () => void;
  script: string;
  imageUrls: ImageInfo[];
  sessionId: string;
  handleNextStep?: () => void;
  onImageUpdate?: (index: number, newImageData: ImageInfo) => void;
}

type ImageInfo = {
  image_id: string;
  image_url: string;
  scene: string;
  voice: string;
};

export function ImageCreation({
  selectedVoice,
  handleBack,
  handleSelectVoice,
  // handleCreateVideo,
  script,
  imageUrls,
  sessionId,
  handleNextStep,
  onImageUpdate,
}: ImageCreationProps) {
  const { regenerateImageAsync, isCreatingImage, isRegeneratingImage } = useImage();
  const { toast } = useToast();
  const [images, setImages] = React.useState<ImageInfo[]>(imageUrls);
  const [regeneratingImages, setRegeneratingImages] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    setImages(imageUrls);
  }, [imageUrls]);

  const handleRegenerateImage = async (imageId: string, index: number) => {
    // Add imageId to regenerating set
    setRegeneratingImages(prev => new Set(prev).add(imageId));
    
    try {
      const response = await regenerateImageAsync({ session_id: sessionId, image_id: imageId });
      if (response) {
        const newImageData = {
          image_id: response.image_id,
          image_url: response.image_url,
          scene: response.scene,
          voice: response.voice,
        };
        
        // Update local state
        const newImages = [...images];
        newImages[index] = newImageData;
        setImages(newImages);
        
        // Notify parent component to update imageUrls
        if (onImageUpdate) {
          onImageUpdate(index, newImageData);
        }
        
        toast({
          title: "Success",
          description: "Image regenerated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to regenerate image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate image.",
        variant: "destructive",
      });
    } finally {
      // Remove imageId from regenerating set
      setRegeneratingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Generation</CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Your image</h3>
          <div className="grid grid-cols-4 gap-3">
            {images.map((imgInfo, idx) => (
              <div
                key={imgInfo.image_id}
                className="aspect-video bg-creative-50 rounded-md cursor-pointer hover:ring-2 hover:ring-creative-400 transition-all"
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  <img
                    src={imgInfo.image_url}
                    alt={`Background ${idx + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => handleRegenerateImage(imgInfo.image_id, idx)}
                    disabled={isCreatingImage || regeneratingImages.has(imgInfo.image_id)}
                  >
                    {regeneratingImages.has(imgInfo.image_id) ? "Regenerating..." : "Regenerate"}
                  </Button>
                </div>
                
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {/* <Button
          onClick={handleCreateVideo}
          disabled={selectedVoice === null || isCreatingImage || isRegeneratingImage}
        >
          Create Video <Check className="ml-2 h-4 w-4" />
        </Button> */}
        <div className="flex item-center justify-between w-full">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            onClick={handleNextStep}
            variant="outline"
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}