import {
  Provider,
  ImageOutput,
  loggingMiddleware,
  uploadMiddleware,
} from '@imgly/plugin-ai-generation-web';
import type CreativeEditorSDK from '@cesdk/cesdk-js';
import apiSchema from './myApiSchema.json';
import axios from 'axios';


// Define your input type based on your schema
interface MyProviderInput {
  prompt: string;
  width: number;
  height: number;
  style: string;
}

// Create a function that returns your provider
export function MyImageProvider({
  apiKey,
  apiUrl = "https://api.together.xyz/v1/images/generations",
}: {
  apiKey: string;
  apiUrl?: string;
}): (context: {
  cesdk: CreativeEditorSDK;
}) => Promise<Provider<'image', MyProviderInput, ImageOutput>> {
  // Return a function that returns the provider
  return async ({ cesdk }) => {
    // Create and return the provider
    const provider: Provider<'image', MyProviderInput, ImageOutput> = {
      // Unique identifier for your provider
      id: 'my-image-provider',

      // Define output type as 'image'
      kind: 'image',

      // Initialize your provider
      initialize: async ({ engine, cesdk }) => {
        console.log('Initializing my image provider');
        // Any setup needed (e.g., API client initialization)
      },

      // Define input panel and UI using schema
      input: {
        panel: {
          type: 'schema',
          document: apiSchema, // Your OpenAPI schema
          inputReference: '#/components/schemas/GenerationInput', // Reference to your input schema
          userFlow: 'placeholder', // Creates a block first, then updates it with the generated content
          orderExtensionKeyword: 'x-order-properties', // Used to control property display order

          // Convert API input to block parameters
          getBlockInput: async input => ({
            image: {
              width: input.width || 512,
              height: input.height || 512,
              label: `AI: ${input.prompt?.substring(0, 20)}...`,
            },
          }),
        },
      },

      // Define output generation behavior
      output: {
        // Allow cancellation of generation
        abortable: true,

        // Store generated assets in browser's IndexedDB
        history: '@imgly/indexedDB',

        // Add middleware for logging and uploading
        middleware: [
          loggingMiddleware(),
          // Example of upload middleware that stores generated images on your server
          uploadMiddleware(async output => {
            // Upload the image to your server
            console.log('Uploading image to server:', output.url);
            // const response = await uploadToCloudinary(output.url)
            // console.log('Upload response:', response);
            return {
              ...output,
              url: output.url, // Adjust based on your upload logic
            };
          }),
        ],

        // Configure success/error notifications
        notification: {
          success: {
            show: true,
            message: 'Image generated successfully!',
          },
          error: {
            show: true,
            message: context => `Generation failed: ${context.error}`,
          },
        },

        // The core generation function
        generate: async (input, { abortSignal }) => {
          try {
            // Call your API to generate an image
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Authorization": `Bearer aa6f6daa3c5d4ae20ebe0df6a66c80474908b61aedcd0d5f4c73cb45a5a60ef1`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: "black-forest-labs/FLUX.1-schnell-Free",
                prompt: input.prompt,
                steps: 4,
                n: 1,
                guidance_scale: 0.0
              }),
              signal: abortSignal,
            });

            if (!response.ok) {
              throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Image generation response:', result);
            console.log('Generated image URL:', result.data[0].url);
            // Return the image URL
            return {
              kind: 'image',
              url: result.data[0].url, // Adjust based on your API response structure
            };
          } catch (error) {
            console.error('Image generation failed:', error);
            throw error;
          }
        },
      },
    };

    return provider;
  };
}