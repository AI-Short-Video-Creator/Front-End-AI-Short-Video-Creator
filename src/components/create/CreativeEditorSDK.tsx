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

interface CreativeEditorSDKComponentProps {
  mediaObject: {
    mediaUrls: string[];
    audioUrl: string;
  };
}

const CreativeEditorSDKComponent: React.FC<CreativeEditorSDKComponentProps> = ({
  mediaObject
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [cesdk, setCesdk] = useState<CreativeEditorSDK | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const isInitialized = useRef(false);

  useEffect(() => {
    let cesdkInstance: CreativeEditorSDK | null = null;

    async function initializeEditor(container: HTMLDivElement) {
      if (isInitialized.current) return;

      try {
        cesdkInstance = await CreativeEditorSDK.create(container, {
          license: "ptq_RSnnXDTByfEVnRDm8bN0GN_fWcmlJ-sGx8Hi7rJ4QaUL9V9fupRCIQFvFF17",
          callbacks: {
            onUpload: "local",
            onDownload: "download",
            onExport: "download"
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

        await createSceneFromMediaObject(cesdkInstance, mediaObject);

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

    async function createSceneFromMediaObject(
      cesdk: CreativeEditorSDK,
      mediaObject: { mediaUrls: string[]; audioUrl: string }
    ) {
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

        for (const url of mediaObject.mediaUrls) {
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

        // Add audio
        const audioBlock = engine.block.create("audio");
        engine.block.appendChild(page, audioBlock);
        engine.block.setString(audioBlock, "audio/fileURI", mediaObject.audioUrl);
        engine.block.setTimeOffset(audioBlock, 0);
        engine.block.setDuration(audioBlock, currentOffset);
        engine.block.setVolume(audioBlock, 0.7);
        engine.block.setDuration(page, currentOffset);
      } catch (error) {
        console.error("createSceneFromMediaObject failed", error);
        toast({
          title: "Error",
          description: "Failed to create video scene.",
          variant: "destructive"
        });
      }
    }

    if (containerRef.current) {
      initializeEditor(containerRef.current);
    }

    return () => {
      if (cesdkInstance) {
        cesdkInstance.dispose();
        setCesdk(null);
        isInitialized.current = false;
      }
    };
  }, [mediaObject]);

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
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Video Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          id="cesdk-container"
          ref={containerRef}
          style={{ width: "100%", height: "calc(100vh - 150px)" }}
        />
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button onClick={handleDownload} disabled={isExporting || !cesdk}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Download Video"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreativeEditorSDKComponent;
