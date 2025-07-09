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
import { MultiSynthesisResponse } from "@/types/workspace";
type mediaInfo = {
  image_id: string;
  image_url: string;
  scene: string;
  voice: string;
};

interface CreativeEditorSDKProps {
  downloadProgress: number,
  handleBack: () => void,
  mediaObject: {
    mediaUrls: mediaInfo[];
    multiSynthesisResponse: MultiSynthesisResponse | null;
  };
  videoTitle?: string;
  thumbnailUrl?: string;
}

const CreativeEditor: React.FC<CreativeEditorSDKProps> = ({
  downloadProgress,
  handleBack,
  mediaObject,
  videoTitle,
  thumbnailUrl,
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
    mediaObject: { mediaUrls: mediaInfo[]; multiSynthesisResponse: MultiSynthesisResponse | null }
  ) => {
    try {
      const engine = cesdk.engine;
      const scene = engine.scene.createVideo();
      const pages = engine.scene.getPages();
      pages.forEach(page => engine.block.destroy(page));
      const page = engine.block.create("page");
      engine.block.appendChild(scene, page);

      const pageW = 1280;
      const pageH = 720;

      engine.block.setWidth(page, pageW);
      engine.block.setHeight(page, pageH);

      const track = engine.block.create("track");
      engine.block.appendChild(page, track);

      let currentOffset = 0;

      // Add title frame at the beginning if we have title or thumbnail
      if (videoTitle || thumbnailUrl) {
        const titleDuration = 3; // 3 seconds for title frame
        
        if (thumbnailUrl) {
          // Create thumbnail graphic block
          const thumbnailGraphic = engine.block.create("graphic");
          engine.block.setShape(thumbnailGraphic, engine.block.createShape("rect"));
          
          const thumbnailFill = engine.block.createFill("image");
          engine.block.setString(thumbnailFill, "fill/image/imageFileURI", thumbnailUrl);
          engine.block.setFill(thumbnailGraphic, thumbnailFill);
          
          engine.block.setTimeOffset(thumbnailGraphic, currentOffset);
          engine.block.setDuration(thumbnailGraphic, titleDuration);
          engine.block.appendChild(track, thumbnailGraphic);
          engine.block.fillParent(thumbnailGraphic);
        }
        
        if (videoTitle) {
          // Create title text block
          const titleBlock = engine.block.create("text");
          engine.block.appendChild(page, titleBlock);
          engine.block.setString(titleBlock, "text/text", videoTitle);
          engine.block.setTimeOffset(titleBlock, currentOffset);
          engine.block.setDuration(titleBlock, titleDuration);

          const titleWidth = pageW * 0.8;
          const titleHeight = 100;
          engine.block.setFloat(titleBlock, "position/x", (pageW - titleWidth) / 2);
          engine.block.setFloat(titleBlock, "position/y", (pageH - titleHeight) / 2);
          engine.block.setFloat(titleBlock, "width", titleWidth);
          engine.block.setFloat(titleBlock, "height", titleHeight);

          // Title styling
          engine.block.setFloat(titleBlock, "text/fontSize", 24);
          engine.block.setEnum(titleBlock, "text/horizontalAlignment", "Center");
          engine.block.setEnum(titleBlock, "text/verticalAlignment", "Center");
          
          // Color settings - white text with black outline
          engine.block.setColor(titleBlock, "fill/solid/color", { r: 1, g: 1, b: 1, a: 1 });
          engine.block.setBool(titleBlock, "stroke/enabled", true);
          engine.block.setColor(titleBlock, "stroke/color", { r: 0, g: 0, b: 0, a: 1 });
          engine.block.setFloat(titleBlock, "stroke/width", 3);
        }
        
        currentOffset += titleDuration;
        console.log("Added title frame, currentOffset:", currentOffset);
      }

      if( mediaObject.multiSynthesisResponse && mediaObject.multiSynthesisResponse.scenes && mediaObject.multiSynthesisResponse.scenes.length > 0) {
        mediaObject.multiSynthesisResponse.scenes.forEach(async (sceneData, index) => {
          // audio block for each scene
          const audioBlock = engine.block.create("audio");
          engine.block.appendChild(page, audioBlock);
          engine.block.setString(audioBlock, "audio/fileURI", sceneData.audio_url);
          engine.block.setTimeOffset(audioBlock, currentOffset);
          engine.block.setDuration(audioBlock, sceneData.duration);
          engine.block.setVolume(audioBlock, 0.7);

          // script block for each scene
          const scriptBlock = engine.block.create("text");
          engine.block.appendChild(page, scriptBlock);
          engine.block.setString(scriptBlock, "text/text", sceneData.script);
          engine.block.setTimeOffset(scriptBlock, currentOffset);
          engine.block.setDuration(scriptBlock, sceneData.duration);

          const textWidth = pageW * 0.9;
          const textHeight = 150;
          engine.block.setFloat(scriptBlock, "position/x", (pageW - textWidth) / 2);
          engine.block.setFloat(scriptBlock, "position/y", pageH - textHeight - 20);
          engine.block.setFloat(scriptBlock, "width", textWidth);
          engine.block.setFloat(scriptBlock, "height", textHeight);

          // Font settings
          engine.block.setFloat(scriptBlock, "text/fontSize", 8);
          engine.block.setEnum(scriptBlock, "text/horizontalAlignment", "Center");
          engine.block.setEnum(scriptBlock, "text/verticalAlignment", "Center");
          
          // Color settings
          engine.block.setColor(scriptBlock, "fill/solid/color", { r: 1, g: 1, b: 1, a: 1 });

          // Stroke settings
          engine.block.setBool(scriptBlock, "stroke/enabled", true);
          engine.block.setColor(scriptBlock, "stroke/color", { r: 0, g: 0, b: 0, a: 1 });
          engine.block.setFloat(scriptBlock, "stroke/width", 2);

          // image block for each scene
          const url = mediaObject.mediaUrls[index]?.image_url || "";
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
          engine.block.setDuration(graphic, sceneData.duration);
          engine.block.appendChild(track, graphic);

          if (isVideo) {
            await engine.block.forceLoadAVResource(fill);
            engine.block.setTrimLength(fill, 10);
            engine.block.setMuted(fill, true);
          }

          engine.block.fillParent(graphic);

          // Update current offset for next scene
          currentOffset += sceneData.duration;
          console.log("set currentOffset", currentOffset);
        });
      }
      engine.block.setDuration(page, currentOffset);

      // Note: CreativeEditorSDK doesn't have a direct setThumbnailURI method.
      // The thumbnail will be handled during export or can be used in the UI.
      if (thumbnailUrl) {
        console.log("Thumbnail URL available for use:", thumbnailUrl);
        // Optionally, you could add the thumbnail as a graphic block at the beginning
        // or use it as a poster frame during video export
      }

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
                await uploadVideoAsync({ 
                  videoFile: exportBlob, 
                  title: videoTitle, 
                  thumbnail: thumbnailUrl 
                });
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
        <CardTitle>
          Video Editor
          {videoTitle && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              - {videoTitle}
            </span>
          )}
        </CardTitle>
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
