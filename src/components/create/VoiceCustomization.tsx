import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Volume2, UploadCloud, RefreshCw, Pause } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import LanguageList from "language-list";
import useVoice from "@/hooks/data/useVoice";
import useAuth from "@/hooks/data/useAuth";
export interface GoogleCloudVoice {
  name: string | null;
  languageCode: string | null;
  speakingRate: number;
  pitch: number;
  volume: number;
}

export interface ElevenLabsClonedVoice {
  voiceId: string | null;
  stability: number;
  speed: number;
  state: "idle" | "processing" | "ready";
  previewUrl?: string | null;
}

interface CloneVoiceRequest {
  audio_file: File;
  voice_name: string;
  preview_script: string;
}

interface VoiceCustomizationProps {
  script: string;
  handleBack: () => void;
  tab: "google" | "elevenlabs";
  setTab: (tab: "google" | "elevenlabs") => void;
  googleCloudVoice: GoogleCloudVoice;
  setGoogleCloudVoice: React.Dispatch<React.SetStateAction<GoogleCloudVoice>>;
  elevenLabsClonedVoice: ElevenLabsClonedVoice;
  setElevenLabsClonedVoice: React.Dispatch<React.SetStateAction<ElevenLabsClonedVoice>>;
  handleGenerateAudio: () => void;
  isGeneratingAudio: boolean;
}

export function VoiceCustomization({
  script,
  handleBack,
  tab,
  setTab,
  googleCloudVoice,
  setGoogleCloudVoice,
  elevenLabsClonedVoice,
  setElevenLabsClonedVoice,
  handleGenerateAudio,
  isGeneratingAudio,
}: VoiceCustomizationProps) {
  const { user } = useAuth();
  const { useGetVoices, cloneVoice, deleteVoice } = useVoice();

  const [selectedLanguage, setSelectedLanguage] = React.useState<string | null>("vi");
  const [languageSearchTerm, setLanguageSearchTerm] = React.useState("");
  const [gender, setGender] = React.useState<"ALL" | "MALE" | "FEMALE">("ALL");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Google voices
  const { data: googleVoiceResponse, isLoading: isLoadingGoogleVoices, error: googleVoicesError } =
    useGetVoices(tab === "google" ? selectedLanguage : "");

  // Language list
  const allLanguagesFromLibrary = React.useMemo(() => new LanguageList().getData(), []);
  const filteredLanguagesFromLibrary = React.useMemo(
    () =>
      allLanguagesFromLibrary.filter((lang) =>
        lang.language.toLowerCase().includes(languageSearchTerm.toLowerCase())
      ),
    [allLanguagesFromLibrary, languageSearchTerm]
  );
  const filteredGoogleVoices = React.useMemo(() => {
    const voices = googleVoiceResponse?.voices || [];
    if (gender === "ALL") return voices;
    return voices.filter((v) => v.gender === gender);
  }, [googleVoiceResponse, gender]);

  // Auto-select first voice when language or gender changes
  React.useEffect(() => {
    if (
      filteredGoogleVoices.length > 0 &&
      (!googleCloudVoice.name ||
        !filteredGoogleVoices.some((v) => v.voice_name === googleCloudVoice.name))
    ) {
      const firstVoice = filteredGoogleVoices[0];
      setGoogleCloudVoice((prev) => ({
        ...prev,
        name: firstVoice.voice_name,
        languageCode: firstVoice.language_code,
      }));
    }
  }, [filteredGoogleVoices]);

  // Stop audio on: tab/language/voice change, or unmount
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, [tab, selectedLanguage, googleCloudVoice.name, elevenLabsClonedVoice.state]);

  // --- Handlers ---

  // Play or stop preview audio
  const handlePreview = (previewUrl: string | undefined | null) => {
    if (!previewUrl) return;
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(previewUrl);
    audioRef.current = audio;
    audio.play();
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
  };

  // ElevenLabs: Upload & clone voice
  const handleFileChangeAndClone = async (cloneVoiceRequest: CloneVoiceRequest) => {
    if (!cloneVoiceRequest.audio_file) return;
    setElevenLabsClonedVoice((prev) => ({ ...prev, state: "processing" }));
    try {
      const result = await cloneVoice(cloneVoiceRequest);
      
      setElevenLabsClonedVoice((prev) => ({
        ...prev,
        voiceId: result.voice_id,
        state: "ready",
        previewUrl: result.preview_url || null,
      }));
    } catch (error) {
      setElevenLabsClonedVoice((prev) => ({ ...prev, state: "idle", voiceId: null }));
      console.error("Cloning failed:", error);
    }
  };

  const extractFirstNarrtion = (script: string) => {
    const narrationLines = script.split(/\r?\n/).filter(line => line.trim().startsWith("Narration:"));
    return narrationLines.map(line => line.slice("Narration:".length).trim())[0];
  }

  const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    handleFileChangeAndClone({
      audio_file: e.dataTransfer.files ? e.dataTransfer.files[0] : null,
      voice_name: user.email,
      preview_script: extractFirstNarrtion(script),
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChangeAndClone({
      audio_file: e.target.files ? e.target.files[0] : null,
      voice_name: user.email,
      preview_script: extractFirstNarrtion(script),
    });
  };

  const handleResetEleven = () => {
    if (elevenLabsClonedVoice.state === "ready" && elevenLabsClonedVoice.voiceId) {
      deleteVoice(elevenLabsClonedVoice.voiceId!);
    }
    setElevenLabsClonedVoice((prev) => ({
      ...prev,
      state: "idle",
      voiceId: null,
      previewUrl: null,
    }));
  };

  // --- JSX ---
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Selection & Customization</CardTitle>
        <CardDescription>
          Choose your voice provider and customize the parameters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "google" | "elevenlabs")} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="google">Voice Library</TabsTrigger>
            <TabsTrigger value="elevenlabs">Your Own Voice</TabsTrigger>
          </TabsList>

          {/* Tab Google */}
          <TabsContent value="google" className="space-y-6">
            {/* Language Selector */}
            <div>
              <label className="block font-medium mb-1">Language</label>
              <Select
                value={selectedLanguage ?? ""}
                onValueChange={(val) => {
                  setSelectedLanguage(val);
                  setGoogleCloudVoice((prev) => ({
                    ...prev,
                    name: null,
                    languageCode: null,
                  }));
                  setGender("ALL");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 sticky top-0 bg-background z-10">
                    <Input
                      placeholder="Search language..."
                      value={languageSearchTerm}
                      onChange={(e) => setLanguageSearchTerm(e.target.value)}
                    />
                  </div>
                  <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {filteredLanguagesFromLibrary.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.language}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Gender Selector */}
            <div>
              <label className="block font-medium mb-1">Gender</label>
              <ToggleGroup
                type="single"
                value={gender}
                onValueChange={(val) => {
                  if (val) setGender(val as any);
                }}
                disabled={!selectedLanguage || isLoadingGoogleVoices}
              >
                <ToggleGroupItem value="ALL">All</ToggleGroupItem>
                <ToggleGroupItem value="MALE">Male</ToggleGroupItem>
                <ToggleGroupItem value="FEMALE">Female</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Voice Selector */}
            <div>
              <label className="block font-medium mb-1">Voice</label>
              {googleVoicesError && (
                <p className="text-sm text-red-500 mb-2">{googleVoicesError.message}</p>
              )}
              <Select
                value={googleCloudVoice.name ?? ""}
                onValueChange={(voiceName) => {
                  const selected = filteredGoogleVoices.find((v) => v.voice_name === voiceName);
                  if (selected) {
                    setGoogleCloudVoice((prev) => ({
                      ...prev,
                      name: selected.voice_name,
                      languageCode: selected.language_code,
                    }));
                  }
                }}
                disabled={
                  !selectedLanguage ||
                  isLoadingGoogleVoices ||
                  filteredGoogleVoices.length === 0
                }
              >
                <SelectTrigger className="w-full">
                  {googleCloudVoice.name
                    ? googleCloudVoice.name
                    : filteredGoogleVoices.length > 0
                    ? filteredGoogleVoices[0].voice_name
                    : "Select voice"}
                </SelectTrigger>
                <SelectContent>
                  {filteredGoogleVoices.map((voice) => (
                    <SelectItem key={voice.voice_name} value={voice.voice_name}>
                      {voice.voice_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview Button */}
            <div>
              <Button
                variant={isPlaying ? "destructive" : "secondary"}
                className="w-full flex items-center justify-center"
                disabled={!googleCloudVoice.name}
                onClick={() => {
                  const voice = filteredGoogleVoices.find(
                    (v) => v.voice_name === googleCloudVoice.name
                  );
                  handlePreview(voice?.preview_url);
                }}
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" /> Stop Preview
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" /> Preview
                  </>
                )}
              </Button>
            </div>

            {/* Speaking Rate */}
            <div>
              <label className="block font-medium mb-1">
                Speaking Rate{" "}
                <span className="ml-2 text-sm text-muted-foreground">
                  {googleCloudVoice.speakingRate.toFixed(2)}x
                </span>
              </label>
              <Slider
                value={[googleCloudVoice.speakingRate]}
                onValueChange={([val]) =>
                  setGoogleCloudVoice((prev) => ({ ...prev, speakingRate: val }))
                }
                min={0.5}
                max={2.0}
                step={0.01}
              />
            </div>

            {/* Pitch */}
            <div>
              <label className="block font-medium mb-1">
                Pitch{" "}
                <span className="ml-2 text-sm text-muted-foreground">
                  {googleCloudVoice.pitch > 0
                    ? `+${googleCloudVoice.pitch}`
                    : googleCloudVoice.pitch}
                </span>
              </label>
              <Slider
                value={[googleCloudVoice.pitch]}
                onValueChange={([val]) =>
                  setGoogleCloudVoice((prev) => ({ ...prev, pitch: val }))
                }
                min={-6}
                max={6}
                step={1}
              />
            </div>

            {/* Volume */}
            <div>
              <label className="block font-medium mb-1">
                Volume{" "}
                <span className="ml-2 text-sm text-muted-foreground">
                  {googleCloudVoice.volume > 0
                    ? `+${googleCloudVoice.volume} dB`
                    : `${googleCloudVoice.volume} dB`}
                </span>
              </label>
              <Slider
                value={[googleCloudVoice.volume]}
                onValueChange={([val]) =>
                  setGoogleCloudVoice((prev) => ({ ...prev, volume: val }))
                }
                min={-10}
                max={6}
                step={1}
              />
            </div>
          </TabsContent>

          {/* Tab ElevenLabs */}
          <TabsContent value="elevenlabs" className="space-y-6">
            {elevenLabsClonedVoice.state === "idle" && (
              <div className="flex flex-col items-center justify-center gap-6 py-8">
                <div className="text-xl font-bold">Create Your Own Voice</div>
                <div className="text-muted-foreground text-center max-w-md">
                  Upload an audio file (less than 1 minute, no background noise) to create your digital voice clone.
                </div>
                <label
                  htmlFor="voice-upload"
                  className="border-2 border-dashed border-primary rounded-lg p-8 flex flex-col items-center cursor-pointer hover:bg-accent transition"
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <UploadCloud className="w-10 h-10 mb-2 text-primary" />
                  <div className="mb-2">Drag & drop your file here</div>
                  <Button asChild variant="outline">
                    <span>Select file from computer</span>
                  </Button>
                  <input
                    id="voice-upload"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </label>
              </div>
            )}
            {elevenLabsClonedVoice.state === "processing" && (
              <div className="flex flex-col items-center justify-center gap-6 py-12">
                <span className="animate-spin w-10 h-10 text-primary">
                  <RefreshCw />
                </span>
                <div className="font-medium text-center">
                  Analyzing and creating your voice.<br />
                  This may take about <b>30 seconds</b>...
                </div>
              </div>
            )}
            {elevenLabsClonedVoice.state === "ready" && (
              <div className="space-y-4">
                <div className="flex pt-5 items-center gap-2 font-semibold">
                  Your voice is ready to use!
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={isPlaying ? "destructive" : "secondary"}
                    className="flex-1 flex items-center justify-center"
                    onClick={() => handlePreview(elevenLabsClonedVoice.previewUrl)}
                    disabled={!elevenLabsClonedVoice.previewUrl}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" /> Stop Preview
                      </>
                    ) : (
                      <>
                        <Volume2 className="mr-2 h-4 w-4" /> Preview
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleResetEleven}
                  >
                    <RefreshCw className="w-4 h-4" /> Upload another file
                  </Button>
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Stability{" "}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {(elevenLabsClonedVoice.stability * 100).toFixed(0)}
                    </span>
                  </label>
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={[elevenLabsClonedVoice.stability]}
                    onValueChange={([val]) =>
                      setElevenLabsClonedVoice((prev) => ({ ...prev, stability: val }))
                    }
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Speed{" "}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {(elevenLabsClonedVoice.speed).toFixed(2)}x
                    </span>
                  </label>
                  <Slider
                    min={0.7}
                    max={1.2}
                    step={0.01}
                    value={[elevenLabsClonedVoice.speed]}
                    onValueChange={([val]) =>
                      setElevenLabsClonedVoice((prev) => ({ ...prev, speed: val }))
                    }
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={handleGenerateAudio}
          disabled={
            (tab === "google" && !googleCloudVoice.name) ||
            (tab === "elevenlabs" && elevenLabsClonedVoice.state !== "ready") ||
            isGeneratingAudio
          }
        >
          {isGeneratingAudio ? (
            <>
              <RefreshCw className="animate-spin mr-2 h-4 w-4" /> Generating Audio...
            </>
          ) : (
            <>
              Generate Audio & Continue <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
