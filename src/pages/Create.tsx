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
import { VoiceCustomization } from "@/components/create/VoiceCustomization"
import useVoice from "@/hooks/data/useVoice"
import useAudioSynthesis from "@/hooks/data/useAudioSynthesis"
// import { VideoResult } from "@/components/create/VideoResult"
import useScript from "@/hooks/data/useScript"
import { readTextFromFile } from "@/helpers/readScriptFromFile"

export default function Create() {
  const totalSteps = 5;

  const navigate = useNavigate();
  const location = useLocation();
  const { createScriptAsync, isCreatingScript } = useScript();
  const { generateAudio, isGeneratingAudio } = useAudioSynthesis();
  const { deleteVoice } = useVoice();
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


  const [tab, setTab] = React.useState<"google" | "elevenlabs">("google");
  const [googleCloudVoice, setGoogleCloudVoice] = React.useState({
    name: null,
    languageCode: null,
    speakingRate: 1.0,
    pitch: 0.0,
    volume: 0.0,
  });
  const [elevenLabsClonedVoice, setElevenLabsClonedVoice] = React.useState({
    voiceId: null,
    stability: 0.5,
    speed: 1.0,
    state: "idle" as "idle" | "processing" | "ready",
  });
  const [generatedAudioPath, setGeneratedAudioPath] = React.useState<string | null>(null);


  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedVoice, setSelectedVoice] = React.useState(null);
  const [selectedKeywords, setSelectedKeywords] = React.useState([]);
  const [imageUrls, setImageUrls] = React.useState([]);
  const [downloadProgress, setDownloadProgress] = React.useState(0);
  const [sessionId, setSessionId] = React.useState("");
  const [videoUrl, setVideoUrl] = React.useState(""); // Changed from videoPath

  
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
    setCurrentStep(5);
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

  const extractNarrtion = (script: string) => {
    const narrationLines = script.split(/\r?\n/).filter(line => line.trim().startsWith("Narration:"));
    return narrationLines.map(line => line.slice("Narration:".length).trim()).join("\n");
  }

  const handleGenerateAudio = async () => {
    if (tab === "google") {
      if (!googleCloudVoice.name || !script) {
        toast({
          title: "Missing Information",
          description: "Please select a voice and provide a script.",
          variant: "destructive",
        });
        return;
      }
      const payload = {
        provider: 'gctts' as const,
        script: extractNarrtion(script),
        voice_name: googleCloudVoice.name,
        language_code: googleCloudVoice.languageCode!,
        speaking_rate: googleCloudVoice.speakingRate,
        pitch: googleCloudVoice.pitch,
        volume_gain_db: googleCloudVoice.volume,
      };
      const result = await generateAudio(payload);
      if (result && result.audio_path) {
        setGeneratedAudioPath(result.audio_path);
        setCurrentStep(4);
      }
    } else if (tab === "elevenlabs") {
      if (!elevenLabsClonedVoice.voiceId || elevenLabsClonedVoice.state !== "ready" || !script) {
        toast({
          title: "Missing Information",
          description: "Please select a voice and provide a script.",
          variant: "destructive",
        });
        return;
      }
      const payload = {
        provider: 'elevenlabs' as const,
        script: extractNarrtion(script),
        voice_id: elevenLabsClonedVoice.voiceId,
        stability: elevenLabsClonedVoice.stability,
        speed: elevenLabsClonedVoice.speed,
      };
      const result = await generateAudio(payload);
      if (result && result.audio_path) {
        setGeneratedAudioPath(result.audio_path);
        setCurrentStep(4);
      }
    }
    if (elevenLabsClonedVoice.voiceId) {
      deleteVoice(elevenLabsClonedVoice.voiceId);
    }
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
            <VoiceCustomization
              script={script}
              handleBack={handleBack}
              tab={tab}
              setTab={setTab}
              googleCloudVoice={googleCloudVoice}
              setGoogleCloudVoice={setGoogleCloudVoice}
              elevenLabsClonedVoice={elevenLabsClonedVoice}
              setElevenLabsClonedVoice={setElevenLabsClonedVoice}
              handleGenerateAudio={handleGenerateAudio}
              isGeneratingAudio={isGeneratingAudio}
            />
          )}
          
          {currentStep === 4 && (
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
          
          {currentStep === 5 && (
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