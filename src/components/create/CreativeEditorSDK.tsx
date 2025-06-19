import React, { useEffect, useRef } from "react";
import CreativeEditorSDK from '@cesdk/cesdk-js';
import ImageGeneration from '@imgly/plugin-ai-image-generation-web';
import { MyImageProvider } from './MyImageProvider';

const CreativeEditorSDKComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cesdkInstance: any;

    async function initializeEditor(container: HTMLDivElement) {
      cesdkInstance = await CreativeEditorSDK.create(container, {
        license: 'ptq_RSnnXDTByfEVnRDm8bN0GN_fWcmlJ-sGx8Hi7rJ4QaUL9V9fupRCIQFvFF17',
        callbacks: {
            onUpload: 'local'
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
                  show: true, // Enable default export button
                },
              },
            },
          },
        },
      });
        await Promise.all([
          cesdkInstance.addDefaultAssetSources(),
          cesdkInstance.addDemoAssetSources({ sceneMode: 'Design' }),
        ]);

      cesdkInstance.addPlugin(
        ImageGeneration({
          text2image: MyImageProvider({
            apiKey: 'aa6f6daa3c5d4ae20ebe0df6a66c80474908b61aedcd0d5f4c73cb45a5a60ef1',
            apiUrl: 'https://api.together.xyz/v1/images/generations',
          }),
          debug: true,
        }),
      );

      await cesdkInstance.createVideoScene();
//await cesdkInstance.createFromVideo('https://img.ly/static/ubq_video_samples/bbb.mp4'); // Thay bằng link video thật
      cesdkInstance.ui.setDockOrder([
        'ly.img.ai/image-generation.dock',
        ...cesdkInstance.ui.getDockOrder(),
      ]);
    }

    if (containerRef.current) {
      initializeEditor(containerRef.current);
    }

    return () => {
      // Cleanup CESDK instance if needed
      if (cesdkInstance && typeof cesdkInstance.dispose === "function") {
        cesdkInstance.dispose();
      }
    };
  }, []);

  return <div id="cesdk-container" ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default CreativeEditorSDKComponent;