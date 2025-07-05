import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Download } from "lucide-react";
import CreativeEditorSDK from "@cesdk/cesdk-js";
import ImageGeneration from "@imgly/plugin-ai-image-generation-web";
import { useToast } from "@/hooks/use-toast";
import { MyImageProvider } from "./MyImageProvider";
import { ArrowLeft } from "lucide-react";
import useFile from "@/hooks/data/useFile";
type mediaInfo = {
  image_id: string;
  image_url: string;
  scene: string;
  voice: string;
};

interface CreativeEditorSDKProps {
  script: string,
  downloadProgress: number,
  handleBack: () => void,
  mediaObject: {
    mediaUrls: mediaInfo[];
    audioUrl: string;
  };
}

const CreativeEditor: React.FC<CreativeEditorSDKProps> = ({
  script,
  downloadProgress,
  handleBack,
  mediaObject,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [cesdk, setCesdk] = useState<CreativeEditorSDK | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { uploadVideoAsync, isUploadingVideo } = useFile();
  const isInitialized = useRef(false);
  const containerId = useRef(`cesdk-container-${Date.now()}`); // Unique container ID

  const createSceneFromMediaObject = async (
    cesdk: CreativeEditorSDK,
    mediaObject: { mediaUrls: mediaInfo[]; audioUrl: string }
  ) => {
    try {
      const engine = cesdk.engine;
      const scene = engine.scene.createVideo();
      const page = engine.block.create("page");
      engine.block.appendChild(scene, page);

      engine.block.setWidth(page, 1280);
      engine.block.setHeight(page, 720);

      const track = engine.block.create("track");
      engine.block.appendChild(page, track);

      let currentOffset = 0;

      for (const element of mediaObject.mediaUrls) {
        const url = element.image_url;
        const isVideo = url.toLowerCase().endsWith(".mp4");
        const graphic = engine.block.create("graphic");
        engine.block.setShape(graphic, engine.block.createShape("rect"));

        const fill = engine.block.createFill(isVideo ? "video" : "image");
        const key = isVideo
          ? "fill/video/fileURI"
          : "fill/image/imageFileURI";
        engine.block.setString(fill, key, url);
        engine.block.setFill(graphic, fill);

        engine.block.setTimeOffset(graphic, currentOffset);
        engine.block.setDuration(graphic, isVideo ? 10 : 5);
        engine.block.appendChild(track, graphic);

        if (isVideo) {
          await engine.block.forceLoadAVResource(fill);
          engine.block.setTrimLength(fill, 10);
          engine.block.setMuted(fill, true);
        }

        engine.block.fillParent(graphic);
        currentOffset += isVideo ? 10 : 5;
        console.log("set currentOffset", currentOffset);
      }

      if( mediaObject.audioUrl ) {
      const audioBlock = engine.block.create("audio");
      engine.block.appendChild(page, audioBlock);
      engine.block.setString(audioBlock, "audio/fileURI", mediaObject.audioUrl);
      engine.block.setTimeOffset(audioBlock, 0);
      engine.block.setDuration(audioBlock, currentOffset);
      engine.block.setVolume(audioBlock, 0.7);
      }
      engine.block.setDuration(page, currentOffset);
    } catch (error) {
      console.error("createSceneFromMediaObject failed", error);
      toast({
        title: "Error",
        description: "Failed to create video scene.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    let cesdkInstance: CreativeEditorSDK | null = null;

    async function initializeEditor(container: HTMLDivElement) {
      if (isInitialized.current || !container) {
        console.log("Editor already initialized or container not ready");
        return;
      }

      console.log("Initializing CreativeEditor SDK...");
      
      try {
        // Ensure container is clean before initialization
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        
        cesdkInstance = await CreativeEditorSDK.create(container, {
          license: "ptq_RSnnXDTByfEVnRDm8bN0GN_fWcmlJ-sGx8Hi7rJ4QaUL9V9fupRCIQFvFF17",
          callbacks: {
            onUpload: "local",
            onDownload: "download",
            onExport: async (file, options) => {
              // Handle file which may be Blob or Blob[]
              const exportBlob = file instanceof Blob
                ? file
                : new Blob(file, { type: options.mimeType });
              // Generate dynamic filename with timestamp
              const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
              const name = `video-export-${timestamp}.mp4`;
              // Trigger client download
              const url = URL.createObjectURL(exportBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = name;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
              // Upload to backend using custom hook
              try {
                await uploadVideoAsync(exportBlob);
              } catch (e) {
                console.error('Video upload failed:', e);
              }
            },
          },
          ui: {
            elements: {
              panels: { settings: true },
              navigation: {
                show: true,
                action: {
                  export: { show: true }
                }
              }
            }
          }
        });

        setCesdk(cesdkInstance);
        isInitialized.current = true;

        await Promise.all([
          cesdkInstance.addDefaultAssetSources(),
          cesdkInstance.addDemoAssetSources({ sceneMode: "Video" })
        ]);

        const apiKey =
          import.meta.env.VITE_TOGETHER_AI_API_KEY ||
          "aa6f6daa3c5d4ae20ebe0df6a66c80474908b61aedcd0d5f4c73cb45a5a60ef1";
        cesdkInstance.addPlugin(
          ImageGeneration({
            text2image: MyImageProvider({
              apiKey,
              apiUrl: "https://api.together.xyz/v1/images/generations"
            }),
            debug: true
          })
        );

        // Only create scene if mediaObject is available
        if (mediaObject?.mediaUrls?.length > 0) {
          await createSceneFromMediaObject(cesdkInstance, mediaObject);
        }

        cesdkInstance.ui.setDockOrder([
          "ly.img.ai/image-generation.dock",
          ...cesdkInstance.ui.getDockOrder()
        ]);

        cesdkInstance.ui.setBackgroundTrackAssetLibraryEntries([
          "ly.img.image",
          "ly.img.video",
          "ly.img.audio"
        ]);
        cesdkInstance.ui.setCanvasMenuOrder([
          "ly.img.ai.text.canvasMenu",
          "ly.img.ai.image.canvasMenu",
          ...cesdkInstance.ui.getCanvasMenuOrder()
        ]);
      } catch (error) {
        console.error("CE.SDK initialization failed:", error);
        toast({
          title: "Error",
          description: `Failed to initialize editor: ${error.message}`,
          variant: "destructive"
        });
      }
    }

    if (containerRef.current && !isInitialized.current) {
      initializeEditor(containerRef.current);
    }

    return () => {
      console.log("Cleaning up CreativeEditor SDK...");
      if (cesdkInstance) {
        try {
          cesdkInstance.dispose();
          console.log("CreativeEditor SDK disposed successfully");
        } catch (error) {
          console.error("Error disposing CreativeEditor SDK:", error);
        }
      }
      setCesdk(null);
      isInitialized.current = false;
    };
  }, []); // Only run once on mount

  // Separate effect to update scene when mediaObject changes
  useEffect(() => {
    if (cesdk && mediaObject?.mediaUrls?.length > 0 && isInitialized.current) {
      console.log("Updating scene with new media object...");
      createSceneFromMediaObject(cesdk, mediaObject).catch(error => {
        console.error("Failed to update scene:", error);
        toast({
          title: "Error",
          description: "Failed to update video scene.",
          variant: "destructive"
        });
      });
    }
  }, [mediaObject, cesdk]);

  const handleDownload = async () => {
    if (!cesdk) {
      toast({
        title: "Error",
        description: "Editor not ready.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    // Implement your export logic here if needed
    setIsExporting(false);
  };

  return (
    <Card className="mx-auto" style={{ width: "80vw", height: "100%" }}>
      <CardHeader>
        <CardTitle>Video Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          id={containerId.current}
          ref={containerRef}
          style={{ width: "100%", height: "calc(100vh - 150px)" }}
        />
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        {/* <Button onClick={handleDownload} disabled={isExporting || !cesdk}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Save to Workspace"}
        </Button> */}
        {/* <Button
          onClick={handleSaveToWorkspace}
        >
          <Image className="mr-2 h-4 w-4" />
          {currentWorkspaceId ? "Update Workspace" : "Save to Workspace"}
        </Button> */}
      </CardFooter>
    </Card>
  );
};

export default CreativeEditor;
