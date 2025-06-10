import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VoiceSelection } from "@/components/content/voice-selection"
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react"
import useImage from "@/hooks/data/useImage"
import { useToast } from "@/hooks/use-toast"

interface ImageCreationProps {
  selectedVoice: number | null
  handleBack: () => void
  handleSelectVoice: (voiceId: number) => void
  handleCreateVideo: () => void
  script: string
  imageUrls: ImageInfo[]
  sessionId: string
}

type ImageInfo = {
  image_url: string
  sentence: string
  image_id: string // Add image_id for regeneration
}

export function ImageCreation({
  selectedVoice,
  handleBack,
  handleSelectVoice,
  handleCreateVideo,
  script,
  imageUrls,
  sessionId
}: ImageCreationProps) {
  const { createImagetAsync, regenerateImageAsync, isCreatingImage } = useImage()
  const { toast } = useToast()
  const [images, setImages] = React.useState<ImageInfo[]>(imageUrls)

  // Update images when prop changes
  React.useEffect(() => {
    setImages(imageUrls)
  }, [imageUrls])

  const handleRegenerateImage = async (imageId, index) => {
    try {
        const response = await regenerateImageAsync({ session_id: sessionId, image_id: imageId })
        if (response) {
            const newImages = [...images]
            newImages[index] = {
                image_url: response.image_url,
                sentence: images[index].sentence,
                image_id: response.image_id
            }
            setImages(newImages)
        } else {
            toast({
                title: "Error",
                description: "Failed to regenerate image.",
                variant: "destructive",
            })
        }
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to regenerate image.",
            variant: "destructive",
        })
    }
}
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Voice & Customize</CardTitle>
        <CardDescription>
          Choose a voice for your video and customize settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VoiceSelection onSelectVoice={handleSelectVoice} />
        
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Background Options</h3>
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
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => handleRegenerateImage(imgInfo.image_id, idx)}
                    disabled={isCreatingImage}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button 
          onClick={handleCreateVideo} 
          disabled={selectedVoice === null}
        >
          Create Video <Check className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}