import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/navigation/header";
import { StepIndicator } from "@/components/ui/step-indicator";
import { TopicSelection } from "@/components/create/TopicSelection";
import { ScriptCreation } from "@/components/create/ScriptCreation";
import { ImageCreation } from "@/components/create/ImageCreation";
import { VideoCreator } from "@/components/create/VideoCreator";
import CreativeEditor from "@/components/create/CreativeEditor";
import useImage from "@/hooks/data/useImage";
import useVideo from "@/hooks/data/useVideo";
import { useToast } from "@/hooks/use-toast";
import { VoiceCustomization } from "@/components/create/VoiceCustomization"
import useVoice from "@/hooks/data/useVoice"
import useAudioSynthesis from "@/hooks/data/useAudioSynthesis"
import useScript from "@/hooks/data/useScript"
import useWorkspace from "@/hooks/data/useWorkspace"
import { readTextFromFile } from "@/helpers/readScriptFromFile"
import { WorkspaceData, CreateWorkspaceRequest } from "@/types/workspace"
import { Button } from "@/components/ui/button"
import { FolderOpen, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { set } from "date-fns";

export default function Create() {
  const totalSteps = 5;

  const navigate = useNavigate();
  const location = useLocation();
  const { createScriptAsync, isCreatingScript, formatScriptAsync, isFormattingScript } = useScript();
  const { generateAudio, isGeneratingAudio } = useAudioSynthesis();
  // const { deleteVoice } = useVoice();
  const { createImagetAsync, isCreatingImage } = useImage();
  const { createVideoAsync, isCreatingVideo } = useVideo();
  const { createWorkspace, isCreatingWorkspace, updateWorkspace, useGetWorkspace } = useWorkspace();
  const { toast } = useToast();

  // Workspace state
  const [currentWorkspaceId, setCurrentWorkspaceId] = React.useState<string | null>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = React.useState(false);
  const [createNewDialog, setCreateNewDialog] = React.useState < {
    isOpen: boolean;
    name: string;
    description: string;
  }>({ isOpen: false, name: "", description: "" });

  // Get workspace data if editing existing workspace
  const { data: workspaceData, isLoading: isLoadingWorkspaceData } = useGetWorkspace(
    currentWorkspaceId || ""
  );

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const workspaceId = params.get('workspace');
    const urlKeyword = params.get('keyword');
    
    if (workspaceId) {
      setCurrentWorkspaceId(workspaceId);
      setIsLoadingWorkspace(true);
    } else if (urlKeyword) {
      setKeyword(urlKeyword);
      handleGenerateScript();
    }
  }, [location.search]);

  // Load workspace data when available
  React.useEffect(() => {
    if (workspaceData && !isLoadingWorkspaceData) {
      loadWorkspaceData(workspaceData);
      setIsLoadingWorkspace(false);
    }
  }, [workspaceData, isLoadingWorkspaceData]);

  const loadWorkspaceData = (workspace: WorkspaceData) => {
    setKeyword(workspace.keyword);
    setPersonalStyle(workspace.personalStyle);
    setScript(workspace.script);
    setCanRegenerate(workspace.canRegenerate);
    setCurrentStep(workspace.currentStep);
    
    // Voice configuration
    setTab(workspace.voiceConfig.tab);
    setGoogleCloudVoice(workspace.voiceConfig.googleCloudVoice);
    setElevenLabsClonedVoice(workspace.voiceConfig.elevenLabsClonedVoice);
    setGeneratedAudioPath(workspace.generatedAudioPath || null);
    
    // Images and video
    setImageUrls(workspace.imageUrls);
    setSessionId(workspace.sessionId);
    setVideoUrl(workspace.videoUrl || "");
  };


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
    previewUrl: "",
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
        console.log("Image URLs set:", imageUrlsResponse.data);
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

  const handleImageUrlUpdate = (index: number, newImageData: any) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = newImageData;
    setImageUrls(newImageUrls);
  };

  // const handleCreateVideo = async () => {
  //   console.log("Creating video...");
  //   setCurrentStep(5);
  // };

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
    content.then(async text => {
      const formattedScript = await formatScriptAsync(text);
      setScript(formattedScript)
      setCanRegenerate(false)
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
      if (result && result.audio_url) {
        setGeneratedAudioPath(result.audio_url);
        setCurrentStep(5);
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
      if (result && result.audio_url) {
        setGeneratedAudioPath(result.audio_url);
        setCurrentStep(5);
      }
    }
    // if (elevenLabsClonedVoice.voiceId) {
    //   deleteVoice(elevenLabsClonedVoice.voiceId);
    // }
  };

  const handleSaveToWorkspace = async () => {
    try {
      const currentWorkspace = workspaceData;
      const workspaceName = currentWorkspaceId ? 
        currentWorkspace?.name : 
        createNewDialog.name.trim();
      
      const workspaceRequestData: CreateWorkspaceRequest = {
        name: workspaceName,
        description: currentWorkspaceId ? workspaceData?.description : createNewDialog.description.trim(),
        keyword: keyword.trim(),
        personalStyle: {
          style: personalStyle.style || "informative",
          language: personalStyle.language || "en",
          wordCount: personalStyle.wordCount || 100,
          tone: personalStyle.tone || "neutral",
          perspective: personalStyle.perspective || "third",
          humor: personalStyle.humor || "none",
          quotes: personalStyle.quotes || "no",
        },
        script: script || "",
        canRegenerate: canRegenerate,
        voiceConfig: {
          tab: tab || "google",
          googleCloudVoice: {
            name: googleCloudVoice.name || "en-US-Wavenet-D",
            languageCode: googleCloudVoice.languageCode || "en-US",
            speakingRate: googleCloudVoice.speakingRate || 1.0,
            pitch: googleCloudVoice.pitch || 0.0,
            volume: googleCloudVoice.volume || 0.0,
          },
          elevenLabsClonedVoice: {
            voiceId: elevenLabsClonedVoice.voiceId || null,
            stability: elevenLabsClonedVoice.stability || 0.5,
            speed: elevenLabsClonedVoice.speed || 1.0,
            state: elevenLabsClonedVoice.state || "idle",
            previewUrl: elevenLabsClonedVoice.previewUrl || null,
          },
        },
        generatedAudioPath: generatedAudioPath || null,
        imageUrls: imageUrls || [],
        sessionId: sessionId || null,
        videoUrl: videoUrl || null,
        totalSteps: totalSteps,
        currentStep: currentStep,
        isCompleted: currentStep === totalSteps,
      };

      console.log('=== Workspace Request Data ===');
      console.log('keyword:', workspaceRequestData.keyword);
      console.log('personalStyle:', workspaceRequestData.personalStyle);
      console.log('voiceConfig:', workspaceRequestData.voiceConfig);
      console.log('Full data:', JSON.stringify(workspaceRequestData, null, 2));

      if (currentWorkspaceId) {
        // Update existing workspace
        await updateWorkspace({
          id: currentWorkspaceId,
          ...workspaceRequestData,
        });
      } else {
        // Create new workspace
        const result = await createWorkspace(workspaceRequestData);
        setCreateNewDialog({ isOpen: false, name: "", description: "" });
        navigate(`/create?workspace=${result.id}`);
      }
    } catch (error) {
      console.error("Failed to save workspace:", error);
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          {isLoadingWorkspace || isLoadingWorkspaceData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-creative-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading workspace...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
              </div>
              
              {currentStep === 1 && (
                <div className="space-y-4">
                  <TopicSelection 
                    script={script}
                    keyword={keyword}
                    setKeyword={setKeyword}
                    handleKeywordSelect={handleKeywordSelect}
                    handleGenerateScript={handleGenerateScript}
                    isGenerating={isCreatingScript}
                    personalStyle={personalStyle}
                    handleChange={handleChange}
                    handleImportScript={handleImportScript}
                    isFormattingScript={isFormattingScript}
                    handleNextStep={handleNextStep}
                  />
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  <ScriptCreation
                    imageUrls={imageUrls}
                    keyword={keyword} 
                    script={script}
                    handleBack={handleBack}
                    handleSaveScript={handleSaveScript}
                    isCreatingImage={isCreatingImage}
                    personalStyle={personalStyle}
                    canRegenerate={canRegenerate}
                    handleNextStep={handleNextStep}
                  />
                </div>
                )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <ImageCreation 
                    selectedVoice={selectedVoice}
                    handleBack={handleBack}
                    handleSelectVoice={handleSelectVoice}
                    // handleCreateVideo={handleCreateVideo}
                    script={script}
                    imageUrls={imageUrls}
                    sessionId={sessionId}
                    handleNextStep={handleNextStep}
                    onImageUpdate={handleImageUrlUpdate}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <VoiceCustomization
                    generatedAudioPath={generatedAudioPath}
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
                    handleNextStep={handleNextStep}
                  />
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4 w-full flex justify-center">
                  <CreativeEditor
                    downloadProgress={downloadProgress}
                    handleBack={handleBack}
                    mediaObject={{ mediaUrls: imageUrls, audioUrl: generatedAudioPath || "" }}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-end mt-4">
                <Button
                  onClick={currentWorkspaceId ? handleSaveToWorkspace : () => setCreateNewDialog({ ...createNewDialog, isOpen: true })}
                  size="sm"
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  {currentWorkspaceId ? "Save Progess" : "Save To New Workspace"}
                </Button>
              </div>
              
              {/* Create New Workspace Dialog */}
              <Dialog open={createNewDialog.isOpen} onOpenChange={(open) => 
                setCreateNewDialog({ ...createNewDialog, isOpen: open })
              }>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                    <DialogDescription>
                      Start a new video project to organize your media and edits.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      required
                      value={createNewDialog.name}
                      onChange={(e) => setCreateNewDialog({ ...createNewDialog, name: e.target.value })}
                      placeholder="Enter workspace name..."
                      className="mt-2"
                    />
                  </div>
                  <div className="py-4">
                    <Label htmlFor="workspace-description">Description</Label>
                    <Input
                      id="workspace-description"
                      value={createNewDialog.description}
                      onChange={(e) => setCreateNewDialog({ ...createNewDialog, description: e.target.value })}
                      placeholder="Enter workspace description..."
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        handleSaveToWorkspace();
                      }}
                      disabled={!createNewDialog.name.trim() || isCreatingWorkspace}
                      className="bg-creative-500 hover:bg-creative-600"
                    >
                      Create Workspace
                      {isCreatingWorkspace && (
                        <RefreshCw className="ml-2 animate-spin h-4 w-4" />
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </main>
    </div>
  );
}