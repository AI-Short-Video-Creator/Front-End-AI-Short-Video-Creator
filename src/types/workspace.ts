export interface WorkspaceData {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: any;
  updatedAt: any;
  userId: string;
  
  // Step 1: Topic/Keyword Selection
  keyword: string;
  personalStyle: PersonalStyle;
  
  // Step 2: Script Creation
  script: string;
  canRegenerate: boolean;
  
  // Step 3: Voice Configuration
  voiceConfig: VoiceConfiguration;
  generatedAudioPath?: string;
  
  // Step 4: Image Generation
  imageUrls: MediaInfo[];
  sessionId: string;
  
  // Step 5: Video Creation
  videoUrl?: string;
  
  // Metadata
  totalSteps: number;
  currentStep: number;
  isCompleted: boolean;
}

export interface PersonalStyle {
  style: string;
  language: string;
  wordCount: number;
  tone: string;
  perspective: string;
  humor: string;
  quotes: string;
}

export interface VoiceConfiguration {
  tab: "google" | "elevenlabs";
  googleCloudVoice: GoogleCloudVoice;
  elevenLabsClonedVoice: ElevenLabsClonedVoice;
}

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
  previewUrl: string | null;
}
export interface MediaInfo {
  image_id: string;
  image_url: string;
  scene: string;
  voice: string;
};

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  keyword?: string;
  personalStyle?: PersonalStyle;
  script?: string;
  canRegenerate?: boolean;
  voiceConfig?: VoiceConfiguration;
  generatedAudioPath?: string;
  imageUrls?: MediaInfo[];
  sessionId?: string;
  videoUrl?: string;
  totalSteps?: number;
  currentStep?: number;
  isCompleted?: boolean;
}

export interface UpdateWorkspaceRequest {
  id: string;
  name?: string;
  description?: string;
  keyword?: string;
  personalStyle?: PersonalStyle;
  script?: string;
  canRegenerate?: boolean;
  voiceConfig?: VoiceConfiguration;
  generatedAudioPath?: string;
  imageUrls?: MediaInfo[];
  sessionId?: string;
  videoUrl?: string;
  totalSteps?: number;
  currentStep?: number;
  isCompleted?: boolean;
}

export interface WorkspaceListItem {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: any;
  updatedAt: any;
  isCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  keyword: string;
}

export interface WorkspaceApiResponse {
  data: WorkspaceData[];
  total: number;
  page: number;
  limit: number;
}
