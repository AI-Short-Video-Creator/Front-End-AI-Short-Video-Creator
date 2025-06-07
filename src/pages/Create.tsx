import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Header } from "@/components/navigation/header"
import { StepIndicator } from "@/components/ui/step-indicator"
import { TopicSelection } from "@/components/create/TopicSelection"
import { ScriptCreation } from "@/components/create/ScriptCreation"
// import { VoiceCustomization } from "@/components/create/VoiceCustomization"
// import { VideoResult } from "@/components/create/VideoResult"
import useScript from "@/hooks/data/useScript"
import { useToast } from "@/hooks/use-toast"

export default function Create() {
  const navigate = useNavigate()
  const location = useLocation()
  const { createScriptAsync, isCreatingScript } = useScript()
  const { toast } = useToast()
  
  // Get topic from URL if available
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlTopic = params.get('topic');
    if (urlTopic) {
      setTopic(urlTopic);
      handleGenerateScript();
    }
  }, [location.search]);
  
  const [currentStep, setCurrentStep] = React.useState(1)
  const [topic, setTopic] = React.useState("")
  const [script, setScript] = React.useState("")
  const [selectedVoice, setSelectedVoice] = React.useState<number | null>(null)
  const [selectedKeywords, setSelectedKeywords] = React.useState<string[]>([])
  const [downloadProgress, setDownloadProgress] = React.useState(0)
  const [contentStyle, setContentStyle] = React.useState("")
  const [language, setLanguage] = React.useState("")
  const [wordCount, setWordCount] = React.useState(100)
  
  
  const totalSteps = 4
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerateScript = async () => {
    if (!topic) {
      toast({
        title: "Error",
        description: "Please enter a topic.",
        variant: "destructive",
      })
      return
    }

    const scriptData = {
      topic,
      keywords: selectedKeywords,
      style: contentStyle,
      language,
      wordCount,
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

  const handleCreateVideo = () => {
    console.log("Creating video...")
    // Simulate video creation delay
    setTimeout(() => {
      setCurrentStep(4)
    }, 2000)
  }
  
  const handleSaveScript = (content: string) => {
    setScript(content)
    setCurrentStep(3)
  }
  
  const handleSelectVoice = (voiceId: number) => {
    setSelectedVoice(voiceId)
  }
  
  const handleKeywordSelect = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword))
    } else {
      setSelectedKeywords([...selectedKeywords, keyword])
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} className="mb-8" />
          
          {currentStep === 1 && (
            <TopicSelection 
              topic={topic}
              setTopic={setTopic}
              selectedKeywords={selectedKeywords}
              handleKeywordSelect={handleKeywordSelect}
              handleGenerateScript={handleGenerateScript}
              isGenerating={isCreatingScript}
              contentStyle={contentStyle}
              setContentStyle={setContentStyle}
              language={language}
              setLanguage={setLanguage}
              wordCount={wordCount}
              setWordCount={setWordCount}
            />
          )}
          
          {currentStep === 2 && (
            <ScriptCreation 
              script={script}
              handleBack={handleBack}
              handleSaveScript={handleSaveScript}
              args={{
                topic,
                keywords: selectedKeywords,
                style: contentStyle,
                language,
                wordCount
              }}
            />
          )}
          
          {/* {currentStep === 3 && (
            <VoiceCustomization 
              selectedVoice={selectedVoice}
              handleBack={handleBack}
              handleSelectVoice={handleSelectVoice}
              handleCreateVideo={handleCreateVideo}
            />
          )}
          
          {currentStep === 4 && (
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
