import * as React from "react"
import { useLocation } from "react-router-dom"
import { Header } from "@/components/navigation/header"
import { StepIndicator } from "@/components/ui/step-indicator"
import { TopicSelection } from "@/components/create/TopicSelection"
import { ScriptCreation } from "@/components/create/ScriptCreation"
import { VoiceCustomization } from "@/components/create/VoiceCustomization"
// import { VideoResult } from "@/components/create/VideoResult"
import useScript from "@/hooks/data/useScript"
import useAudioSynthesis from "@/hooks/data/useAudioSynthesis"
import { useToast } from "@/hooks/use-toast"
import useVoice from "@/hooks/data/useVoice"

export default function Create() {
  const totalSteps = 4
  const [currentStep, setCurrentStep] = React.useState(1)

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const location = useLocation()
  const { toast } = useToast()
  const { createScriptAsync, isCreatingScript } = useScript()
  
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlKeyword = params.get('keyword');
    if (urlKeyword) {
      setKeyword(urlKeyword);
      handleGenerateScript();
    }
  }, [location.search]);
  
  const [keyword, setKeyword] = React.useState("")
  const [script, setScript] = React.useState("Ma Gaming đã trở thành một cái tên không thể không nhắc đến trong cộng đồng Free Fire tại Việt Nam. Anh được biết đến không chỉ nhờ những pha xử lý đẳng cấp mà còn bởi lối chơi cống hiến đầy ấn tượng trên sàn đấu. Khi nhắc đến Ma Gaming, người hâm mộ sẽ nghĩ ngay đến kỹ năng cá nhân điêu luyện cùng với khả năng phối hợp đồng đội ăn ý, tạo nên những màn trình diễn khó quên. Không chỉ dừng lại ở vai trò một streamer giải trí, Ma Gaming còn là nguồn cảm hứng lớn cho rất nhiều game thủ trẻ. Anh thể hiện qua niềm đam mê cháy bỏng và sự nỗ lực không ngừng nghỉ để hoàn thiện bản thân mỗi ngày. Dù là trong những trận đấu đỉnh cao đầy căng thẳng hay trong các buổi livestream giao lưu thân mật, Ma Gaming luôn biết cách mang đến những khoảnh khắc giải trí đầy kịch tính và ý nghĩa, giữ chân người xem qua từng phút giây.")

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

  const handleGenerateScript = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a keyword.",
        variant: "destructive",
      })
      return
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
      setCurrentStep(2)
    } else {
      toast({
        title: "Error",
        description: "Failed to generate script.",
        variant: "destructive",
      })
    }
  }
  
  const handleSaveScript = (content: string) => {
    setScript(content)
    setCurrentStep(3)
  }
  
  const handleKeywordSelect = (keyword: string) => {
    setKeyword(keyword)
  }

  // Hook for audio synthesis
  const { generateAudio, isGeneratingAudio } = useAudioSynthesis();
  const { deleteVoice } = useVoice();

  // State for voice customization
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
  
  // Function to handle audio generation based on selected voice and script
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
        text: script,
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
        text: script,
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
            />
          )}
          
          {currentStep === 2 && (
            <ScriptCreation
              keyword={keyword} 
              script={script}
              handleBack={handleBack}
              handleSaveScript={handleSaveScript}
              personalStyle={personalStyle}
            />
          )}
          
          {currentStep === 3 && (
            <VoiceCustomization
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
          
          { /*{currentStep === 4 && (
            <VideoResult
              downloadProgress={downloadProgress}
              handleBack={handleBack}
              handleDownload={handleDownload}
            />
          )} */}
        </div>
      </main>
    </div>
  )
}
