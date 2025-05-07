
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to use WebGPU if available and avoid using browser cache
env.allowLocalModels = false;
env.useBrowserCache = false;

// Class to handle text removal operations
export class TextEraser {
  private static segmenter: any = null;
  private static isLoading: boolean = false;
  private static loadPromise: Promise<any> | null = null;

  /**
   * Load the segmentation model
   */
  public static async loadModel() {
    if (this.segmenter) {
      return this.segmenter;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    console.log('Loading text removal model...');

    try {
      this.loadPromise = pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
        device: 'webgpu',
      });
      
      this.segmenter = await this.loadPromise;
      console.log('Text removal model loaded successfully');
      return this.segmenter;
    } catch (error) {
      console.error('Error loading text removal model:', error);
      throw error;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  /**
   * Process image with erased regions
   * @param canvas The canvas containing the original image
   * @param eraseRects The rectangles defining the areas to erase
   * @returns Canvas with the processed image
   */
  public static async eraseText(
    canvas: HTMLCanvasElement, 
    eraseRects: { x: number, y: number, width: number, height: number }[]
  ): Promise<HTMLCanvasElement> {
    try {
      if (eraseRects.length === 0) return canvas;
      
      // Load the segmentation model if not already loaded
      await this.loadModel();

      // Create a working copy of the canvas
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = canvas.width;
      outputCanvas.height = canvas.height;
      const outputCtx = outputCanvas.getContext('2d');
      
      if (!outputCtx) {
        throw new Error('Could not get output canvas context');
      }
      
      // Draw the original image
      outputCtx.drawImage(canvas, 0, 0);
      
      // Process each erase rectangle
      for (const rect of eraseRects) {
        // Convert percentage to pixels
        const x = Math.floor((rect.x / 100) * canvas.width);
        const y = Math.floor((rect.y / 100) * canvas.height);
        const width = Math.floor((rect.width / 100) * canvas.width);
        const height = Math.floor((rect.height / 100) * canvas.height);
        
        // Skip if rectangle is too small
        if (width < 5 || height < 5) continue;
        
        // Extract the area to process
        const areaCanvas = document.createElement('canvas');
        areaCanvas.width = width;
        areaCanvas.height = height;
        const areaCtx = areaCanvas.getContext('2d');
        
        if (!areaCtx) {
          throw new Error('Could not get area canvas context');
        }
        
        // Draw the area to process
        areaCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
        
        // Get the image data URL
        const imageDataUrl = areaCanvas.toDataURL('image/jpeg', 0.9);
        
        console.log(`Processing area: ${width}x${height} at (${x},${y})`);
        
        // Process the image with the segmentation model
        const result = await this.segmenter(imageDataUrl);
        
        if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
          console.warn('Invalid segmentation result for area');
          continue;
        }
        
        // Apply inpainting to remove text
        const targetCtx = areaCanvas.getContext('2d');
        if (!targetCtx) continue;
        
        const imageData = targetCtx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Get pixel values from surrounding areas for inpainting
        const surroundingPixels = this.getSurroundingPixels(imageData, result[0].mask.data);
        
        // Apply inpainting based on the mask
        for (let i = 0; i < result[0].mask.data.length; i++) {
          const maskValue = result[0].mask.data[i];
          // If mask value is high (likely text), apply inpainting
          if (maskValue > 0.3) {
            const pixelIndex = i * 4;
            // Use surrounding pixel values for inpainting
            const replacementPixel = surroundingPixels[i % surroundingPixels.length];
            data[pixelIndex] = replacementPixel.r;     // R
            data[pixelIndex + 1] = replacementPixel.g; // G
            data[pixelIndex + 2] = replacementPixel.b; // B
            // Keep the alpha value unchanged
          }
        }
        
        targetCtx.putImageData(imageData, 0, 0);
        
        // Put the processed area back onto the output canvas
        outputCtx.drawImage(areaCanvas, 0, 0, width, height, x, y, width, height);
      }
      
      console.log('Text erasing completed successfully');
      return outputCanvas;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }
  
  /**
   * Get surrounding pixels for inpainting
   * @param imageData The image data
   * @param mask The mask data
   * @returns Array of surrounding pixel values
   */
  private static getSurroundingPixels(
    imageData: ImageData, 
    mask: Float32Array
  ): Array<{r: number, g: number, b: number}> {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const surroundingPixels: Array<{r: number, g: number, b: number}> = [];
    
    // Sample pixels from areas where the mask value is low (likely background)
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] < 0.1) { // Threshold for background pixels
        const pixelIndex = i * 4;
        surroundingPixels.push({
          r: data[pixelIndex],
          g: data[pixelIndex + 1],
          b: data[pixelIndex + 2]
        });
      }
    }
    
    // If we didn't find enough background pixels, add some default values
    if (surroundingPixels.length < 100) {
      // Add some default pixel values (various shades of white/gray)
      for (let i = 0; i < 100; i++) {
        const value = 240 - (i % 30);
        surroundingPixels.push({r: value, g: value, b: value});
      }
    }
    
    return surroundingPixels;
  }
}
