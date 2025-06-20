import React, { useEffect, useRef, useState, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Download } from "lucide-react";
import CreativeEditorSDK from "@cesdk/cesdk-js";
import ImageGeneration from "@imgly/plugin-ai-image-generation-web";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { MyImageProvider } from "./MyImageProvider";

interface CreativeEditorSDKComponentProps {
  imageUrls?: string[];
}

const CreativeEditorSDKComponent: React.FC<CreativeEditorSDKComponentProps> = ({
  imageUrls = [ "https://res.cloudinary.com/create-video-ai/image/upload/v1749499201/video_creator/images/bdbd833d-a179-4fcd-9466-ddab7dba9372.jpg","https://res.cloudinary.com/create-video-ai/image/upload/v1749499201/video_creator/images/bdbd833d-a179-4fcd-9466-ddab7dba9372.jpg"],
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
      // Prevent multiple initializations
      if (isInitialized.current) {
        console.log("CE.SDK already initialized, skipping.");
        return;
      }

      try {
        console.log("Initializing CE.SDK instance...");
        cesdkInstance = await CreativeEditorSDK.create(container, {
          license: "ptq_RSnnXDTByfEVnRDm8bN0GN_fWcmlJ-sGx8Hi7rJ4QaUL9V9fupRCIQFvFF17",
          callbacks: {
            onUpload: "local",
            onSave: async () => {
              try {
                const sceneData = await cesdkInstance!.engine.scene.saveToString();
                localStorage.setItem("cesdk_scene", sceneData);
                toast({
                  title: "Success",
                  description: "Scene saved successfully.",
                });
              } catch (error) {
                console.error("Save failed:", error);
                toast({
                  title: "Error",
                  description: "Failed to save scene.",
                  variant: "destructive",
                });
              }
            },
            onDownload: async () => {
              try {
                await handleDownload();
              } catch (error) {
                console.error("Download failed:", error);
                toast({
                  title: "Error",
                  description: "Failed to download video.",
                  variant: "destructive",
                });
              }
            },
          },
          ui: {
            elements: {
              panels: {
                settings: true,
              },
              navigation: {
                show: true,
                action: {
                  export: {
                    show: true,
                  },
                },
              },
            },
          },
        });

        setCesdk(cesdkInstance);
        isInitialized.current = true;

        await Promise.all([
          cesdkInstance.addDefaultAssetSources(),
          cesdkInstance.addDemoAssetSources({ sceneMode: "Video" }),
        ]);

        const apiKey = import.meta.env.VITE_TOGETHER_AI_API_KEY || "aa6f6daa3c5d4ae20ebe0df6a66c80474908b61aedcd0d5f4c73cb45a5a60ef1";
        if (!apiKey) {
          throw new Error("Together AI API key is missing.");
        }

        cesdkInstance.addPlugin(
          ImageGeneration({
            text2image: MyImageProvider({
              apiKey,
              apiUrl: "https://api.together.xyz/v1/images/generations",
            }),
            debug: true,
          })
        );

        // Load saved scene or create new video scene with images
        const savedScene = localStorage.getItem("cesdk_scene");
        // if (savedScene) {
        //   try {
        //     console.log("Loading saved scene from localStorage...", savedScene);
        //     await cesdkInstance.engine.scene.loadFromString(savedScene);
        //     console.log("Loaded saved scene successfully.");
        //     toast({
        //       title: "Success",
        //       description: "Loaded saved scene.",
        //     });
        //   } catch (error) {
        //     console.error("Failed to load saved scene:", error);
        //     await createVideoSceneWithImages(cesdkInstance);
        //     toast({
        //       title: "Error",
        //       description: "Failed to load saved scene. Starting new scene.",
        //       variant: "destructive",
        //     });
        //   }
        // } else {
          await createVideoSceneWithImages(cesdkInstance);
        //}

          cesdkInstance.ui.setDockOrder([
            'ly.img.ai/image-generation.dock',
            ...cesdkInstance.ui.getDockOrder(),
          ]);

        cesdkInstance.ui.setBackgroundTrackAssetLibraryEntries(["ly.img.image", "ly.img.video", "ly.img.audio"]);
        cesdkInstance.ui.setCanvasMenuOrder([
            'ly.img.ai.text.canvasMenu',
            'ly.img.ai.image.canvasMenu',
            ...cesdkInstance.ui.getCanvasMenuOrder(),
          ]);
      } catch (error) {
        console.error("CE.SDK initialization error:", error);
        isInitialized.current = false;
        throw error;
      }
    }

    async function createVideoSceneWithImages(cesdk: CreativeEditorSDK) {
  try {
    if (imageUrls.length < 2) {
      throw new Error("At least two image URLs are required to create two scenes.");
    }

    // Create and save first scene
    await cesdk.createVideoScene();
    const page1 = cesdk.engine.block.findByType("//ly.img.ubq/page")[0];
    if (!page1) {
      throw new Error("No page found in scene 1.");
    }
    const block1 = cesdk.engine.block.create("//ly.img.ubq/graphic");
    const fill1 = cesdk.engine.block.createFill("//ly.img.ubq/fill/image");
    cesdk.engine.block.setString(fill1, "fill/image/imageFileURI", imageUrls[0]);
    cesdk.engine.block.setFill(block1, fill1);
    cesdk.engine.block.appendChild(page1, block1);
    cesdk.engine.block.setDouble(block1, "playback/timeOffset", 0);
    cesdk.engine.block.setDouble(block1, "playback/duration", 5);
    cesdk.engine.block.setFloat(block1, "position/x", 0);
    cesdk.engine.block.setFloat(block1, "position/y", 0);
    cesdk.engine.block.setFloat(block1, "width", 1920);
    cesdk.engine.block.setFloat(block1, "height", 1080);
    console.log("Scene 1 block properties:", cesdk.engine.block.findAllProperties(block1));
    const sceneData1 = await cesdk.engine.scene.saveToString();
    localStorage.setItem("cesdk_scene_1", sceneData1);

    // Create and save second scene
    await cesdk.createVideoScene();
    const page2 = cesdk.engine.block.findByType("//ly.img.ubq/page")[0];
    if (!page2) {
      throw new Error("No page found in scene 2.");
    }
    const block2 = cesdk.engine.block.create("//ly.img.ubq/graphic");
    const fill2 = cesdk.engine.block.createFill("//ly.img.ubq/fill/image");
    cesdk.engine.block.setString(fill2, "fill/image/imageFileURI", imageUrls[1]);
    cesdk.engine.block.setFill(block2, fill2);
    cesdk.engine.block.appendChild(page2, block2);
    cesdk.engine.block.setDouble(block2, "playback/timeOffset", 0);
    cesdk.engine.block.setDouble(block2, "playback/duration", 5);
    cesdk.engine.block.setFloat(block2, "position/x", 0);
    cesdk.engine.block.setFloat(block2, "position/y", 0);
    cesdk.engine.block.setFloat(block2, "width", 1920);
    cesdk.engine.block.setFloat(block2, "height", 1080);
    console.log("Scene 2 block properties:", cesdk.engine.block.findAllProperties(block2));
    const sceneData2 = await cesdk.engine.scene.saveToString();
    localStorage.setItem("cesdk_scene_2", sceneData2);

    // Set back to the first scene for initial display (note: this overwrites the current scene)
    await cesdk.engine.scene.loadFromString(sceneData1);
  } catch (error) {
    console.error("Failed to create video scenes:", error);
    // Fallback to empty video scene
    await cesdk.createVideoScene();
    toast({
      title: "Error",
      description: "Failed to add images to scenes. Created empty scene.",
      variant: "destructive",
    });
    throw error;
  }
}

    if (containerRef.current && !cesdk) {
      initializeEditor(containerRef.current).catch((error) => {
        console.error("CE.SDK initialization failed:", error);
        toast({
          title: "Error",
          description: `Failed to initialize video editor: ${error.message}`,
          variant: "destructive",
        });
      });
    }

    return () => {
      console.log("Cleaning up CE.SDK instance...");
      if (cesdkInstance) {
        cesdkInstance.dispose();
        cesdkInstance = null;
        setCesdk(null);
        isInitialized.current = false;
      }
    };
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!cesdk || !event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const validImageTypes = ["image/png", "image/jpeg"];

    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a PNG or JPEG image.",
        variant: "destructive",
      });
      return;
    }

    // try {
    //   const formData = new FormData();
    //   formData.append("file", file);
    //   const response = await axios.post("/api/upload", formData);
    //   const url = response.data.url;

    //   const page = cesdk.engine.block.findByType("//ly.img.ubq/page")[0];
    //   const block = cesdk.engine.block.create("//ly.img.ubq/graphic");
    //   const fill = cesdk.engine.block.createFill("//ly.img.ubq/fill/image");
    //   cesdk.engine.block.setString(fill, "fill/image/imageFileURI", url);
    //   cesdk.engine.block.setFill(block, fill);
    //   cesdk.engine.block.appendChild(page, block);
    //   // Use setDouble for numeric properties
    //   cesdk.engine.block.setFloat(block, "position/x", 0);
    //   cesdk.engine.block.setFloat(block, "position/y", 0);
    //   cesdk.engine.block.setDouble(block, "width", 1920);
    //   cesdk.engine.block.setDouble(block, "height", 1080);

    //   const sceneData = await cesdk.engine.scene.saveToString();
    //   localStorage.setItem("cesdk_scene", sceneData);

    //   toast({
    //     title: "Success",
    //     description: "Image uploaded successfully.",
    //   });
    // } catch (error) {
    //   console.error("Image upload failed:", error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to upload image.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   event.target.value = "";
    // }
  };

  const handleDownload = async () => {
    if (!cesdk) {
      toast({
        title: "Error",
        description: "Editor not initialized.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
   
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
        <input
          type="file"
          ref={imageInputRef}
          accept="image/png,image/jpeg"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
        <Button onClick={() => imageInputRef.current?.click()}>
          <Image className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
        <Button onClick={handleDownload} disabled={isExporting || !cesdk}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Download Video"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreativeEditorSDKComponent;