
import { useState } from 'react';

interface RemoveTextZonesProps {
  image: string;
  zones: Array<{ x: number; y: number; width: number; height: number }>;
}

interface RemoveTextZonesResult {
  isLoading: boolean;
  error: string | null;
  cleanedImage: string | null;
  removeTextZones: (image: string, zones: Array<{ x: number; y: number; width: number; height: number }>) => Promise<void>;
}

export const useRemoveTextZones = (): RemoveTextZonesResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cleanedImage, setCleanedImage] = useState<string | null>(null);

  const removeTextZones = async (
    originalImageDataUrl: string,
    zones: Array<{ x: number; y: number; width: number; height: number }>
  ) => {
    setIsLoading(true);
    setError(null);
    setCleanedImage(null);

    try {
      console.log('Zones envoyées:', zones);
      
      const res = await fetch('/api/ocr-remove-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: originalImageDataUrl, zones })
      });
      
      console.log('API status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error:', errorText);
        throw new Error(`API Error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      console.log('cleanedImage:', data.cleanedImage);
      
      if (!data.cleanedImage) {
        throw new Error('API did not return cleaned image data');
      }
      
      setCleanedImage(data.cleanedImage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Text removal error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, cleanedImage, removeTextZones };
};
