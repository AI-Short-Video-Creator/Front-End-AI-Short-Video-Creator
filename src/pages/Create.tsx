import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/navigation/header";
import { StepIndicator } from "@/components/ui/step-indicator";
import { TopicSelection } from "@/components/create/TopicSelection";
import { ScriptCreation } from "@/components/create/ScriptCreation";
import {ImageCreation} from "@/components/create/ImageCreation";
import { VideoCreator } from "@/components/create/VideoCreator";
import CreativeEditor from "@/components/create/CreativeEditor";
import useImage from "@/hooks/data/useImage";
import useVideo from "@/hooks/data/useVideo";
import { useToast } from "@/hooks/use-toast";
// import { VoiceCustomization } from "@/components/create/VoiceCustomization"
// import { VideoResult } from "@/components/create/VideoResult"
import useScript from "@/hooks/data/useScript"
import { readTextFromFile } from "@/helpers/readScriptFromFile"

export default function Create() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createScriptAsync, isCreatingScript } = useScript();
  const { createImagetAsync, isCreatingImage } = useImage();
  const { createVideoAsync, isCreatingVideo } = useVideo();
  const { toast } = useToast();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlKeyword = params.get('keyword');
    if (urlKeyword) {
      setKeyword(urlKeyword);
      handleGenerateScript();
    }
  }, [location.search]);

  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedVoice, setSelectedVoice] = React.useState(null);
  const [selectedKeywords, setSelectedKeywords] = React.useState([]);
  const [imageUrls, setImageUrls] = React.useState([]);
  const [downloadProgress, setDownloadProgress] = React.useState(0);
  const [sessionId, setSessionId] = React.useState("");
  const [videoUrl, setVideoUrl] = React.useState(""); // Changed from videoPath

  const totalSteps = 4;

  
  const [keyword, setKeyword] = React.useState("")
  const [script, setScript] = React.useState("")
  const [canRegenerate, setCanRegenerate] = React.useState(true)

  const [personalStyle, setPersonalStyle] = React.useState({
    style: "informative",
    language: "en",
    wordCount: 100,
    tone: "neutral",
    perspective: "third",
    humor: "none",
    quotes: "no",
  })

  const handleChange = (field: string, value: any) => {
    setPersonalStyle(prev => ({ ...prev, [field]: value }))
  }

  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateScript = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a keyword.",
        variant: "destructive",
      });
      return;
    }

    const scriptData = {
      keyword,
      personalStyle: {
        style: personalStyle.style,
        language: personalStyle.language,
        wordCount: personalStyle.wordCount,
        tone: personalStyle.tone,
        perspective: personalStyle.perspective,
        humor: personalStyle.humor,
        quotes: personalStyle.quotes,
      }
    }

    const script = await createScriptAsync(scriptData)
    if (script) {
      setScript(script.data)
      setCanRegenerate(true)
      setCurrentStep(2)
    } else {
      toast({
        title: "Error",
        description: "Failed to generate script.",
        variant: "destructive",
      });
    }
  };

  const handleSaveScript = async (content: string) => {
    setScript(content);
    console.log("Saving script:", content);
    try {
      const imageUrlsResponse = await createImagetAsync({ script: content, themes: "realistic" });
      console.log("Image URLs response:", imageUrlsResponse);
      if (imageUrlsResponse) {
        setImageUrls(imageUrlsResponse.data);
        setSessionId(imageUrlsResponse.session_id);
        setCurrentStep(3);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate images.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate images.",
        variant: "destructive",
      });
    }
  };

  const handleCreateVideo = async () => {
    console.log("Creating video...");
    setCurrentStep(4);
  };

  const handleSelectVoice = (voiceId: any) => {
    setSelectedVoice(voiceId);
  };

  const handleDownload = () => {
    console.log("Preparing download...");
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setDownloadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        navigate("/library");
      }
    }, 300);
  };

  const handleKeywordSelect = (keyword: string) => {
    setKeyword(keyword)
  }

  const handleImportScript = (file: File) => {
    const content = readTextFromFile(file)
    content.then(text => {
      setScript(text)
      setCanRegenerate(false)
      console.log("Can regenerate set to false")
      setCurrentStep(2)
    }).catch(error => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    })
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} className="mb-8" />
          
          {currentStep === 1 && (
            <TopicSelection 
              keyword={keyword}
              setKeyword={setKeyword}
              handleKeywordSelect={handleKeywordSelect}
              handleGenerateScript={handleGenerateScript}
              isGenerating={isCreatingScript}
              personalStyle={personalStyle}
              handleChange={handleChange}
              handleImportScript={handleImportScript}
            />
          )}
          
          {currentStep === 2 && (
            <ScriptCreation
              keyword={keyword} 
              script={script}
              handleBack={handleBack}
              handleSaveScript={handleSaveScript}
              personalStyle={personalStyle}
              canRegenerate={canRegenerate}
            />
          )}
          
          {currentStep === 3 && (
            <ImageCreation 
              selectedVoice={selectedVoice}
              handleBack={handleBack}
              handleSelectVoice={handleSelectVoice}
              handleCreateVideo={handleCreateVideo}
              script={script}
              imageUrls={imageUrls}
              sessionId={sessionId}
            />
          )}
          
          {currentStep === 4 && (
            <CreativeEditor
              downloadProgress={downloadProgress}
              handleBack={handleBack}
              mediaObject={{mediaUrls: imageUrls, audioUrl: ""}} // Changed from videoPath
            />
          )}

          
        </div>
      </main>
    </div>
  );
}