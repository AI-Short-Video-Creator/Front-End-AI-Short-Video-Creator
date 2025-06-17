import CreativeEditorSDK from '@cesdk/cesdk-js';
import {ImageGeneration} from '@imgly/plugin-ai-image-generation-web';
import { MyImageProvider } from './MyImageProvider';

// Initialize the editor
async function initializeEditor(container: HTMLElement) {
  const cesdk = await CreativeEditorSDK.create(container, {
    license: 'your-cesdk-license-key',
  });

  // Add default asset sources
  await cesdk.addDefaultAssetSources();

  // Add your image generation provider
  cesdk.addPlugin(
    ImageGeneration({
      text2image: MyImageProvider({
        apiKey: 'your-api-key',
        apiUrl: 'https://your-api-url.com',
      }),
      debug: true,
    }),
  );

  // Create a design scene
  await cesdk.createDesignScene();

  // Add the dock component to open the AI image generation panel
  cesdk.ui.setDockOrder([
    'ly.img.ai/image-generation.dock',
    ...cesdk.ui.getDockOrder(),
  ]);

  return cesdk;
}

// Start the editor when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cesdk-container');
  if (container) {
    initializeEditor(container);
  }
});