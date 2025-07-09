import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VoiceSelection } from "@/components/content/voice-selection";
import { ArrowLeft, ArrowRight, Check, Image, Type, Sparkles } from "lucide-react";
import useImage from "@/hooks/data/useImage";
import useCaption from "@/hooks/data/useCaption";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  onVideoMetaUpdate?: (title: string, thumbnail: string) => void;
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
  onVideoMetaUpdate,

}: ImageCreationProps) {
  const { regenerateImageAsync, isCreatingImage, isRegeneratingImage, createImagetAsync } = useImage();
  const { generateCaptionAsync, isGeneratingCaption } = useCaption();
  const { toast } = useToast();
  const [images, setImages] = React.useState<ImageInfo[]>(imageUrls);
  const [regeneratingImages, setRegeneratingImages] = React.useState<Set<string>>(new Set());
  const [videoTitle, setVideoTitle] = React.useState("");
  const [thumbnailUrl, setThumbnailUrl] = React.useState("");
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = React.useState(false);

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

  const handleGenerateTitle = async () => {
    try {
      const response = await generateCaptionAsync({
        video_context: script,
        lang: 'en'
      });
      
      if (response) {
        setVideoTitle(response.title);
        toast({
          title: "Success",
          description: "Title generated successfully.",
        });
      }
    } catch (error) {
      console.error('Error generating title:', error);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!videoTitle.trim()) {
      toast({
        title: "Error",
        description: "Please generate a title first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingThumbnail(true);
    try {
      const thumbnailPrompt = `Create a YouTube thumbnail for: "${videoTitle}". Make it eye-catching, professional, and engaging with bold text overlay.`;
      
      const response = await createImagetAsync({ 
        script: `[Scene 1: ${thumbnailPrompt}]\nNarration: ${videoTitle}`, 
        themes: "YouTube thumbnail" 
      });
      
      if (response && response.data && response.data.length > 0) {
        const thumbnailImage = response.data[0];
        setThumbnailUrl(thumbnailImage.image_url);
        toast({
          title: "Success",
          description: "Thumbnail generated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate thumbnail.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const handleNextWithMeta = () => {
    if (onVideoMetaUpdate) {
      onVideoMetaUpdate(videoTitle, thumbnailUrl);
    }
    if (handleNextStep) {
      handleNextStep();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Generation & Video Settings</CardTitle>
        <CardDescription>
          Generate images for your video scenes and create title & thumbnail
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Video Title & Thumbnail Section - 2 Column Grid */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls Column - 1 column */}
          <div className="space-y-4">
            {/* Video Title Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">Video Title</h3>
              <Input
                placeholder="Enter video title or generate one..."
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full mb-2"
              />
              <Button 
                onClick={handleGenerateTitle}
                disabled={isGeneratingCaption}
                variant="outline"
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGeneratingCaption ? "Generating..." : "Generate"}
              </Button>
            </div>

            {/* Video Thumbnail Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">Video Thumbnail</h3>
              <Button 
                onClick={handleGenerateThumbnail}
                disabled={isGeneratingThumbnail || !videoTitle.trim()}
                variant="outline"
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGeneratingThumbnail ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>

          {/* Thumbnail Display - 1 column */}
          <div className="h-full flex flex-col">
            {thumbnailUrl ? (
              <div className="w-full flex-1 rounded-md overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={thumbnailUrl}
                  alt="Generated thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full flex-1 bg-gray-50 rounded-md border-4 border-white shadow-lg flex flex-col items-center justify-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
                  <Image className="h-12 w-12 text-gray-400 mb-3" />
                  <span className="text-sm text-gray-500 text-center font-medium">
                    Thumbnail Preview
                  </span>
                  <span className="text-xs text-gray-400 text-center mt-1">
                    Generate a title first, then create thumbnail
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Scene Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
            onClick={handleNextWithMeta}
            variant="outline"
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}