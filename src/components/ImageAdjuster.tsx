
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageAdjusterProps {
  brightness: number;
  contrast: number;
  rotation: number;
  scale: number;
  onSettingChange: (setting: string, value: number) => void;
}

const ImageAdjuster: React.FC<ImageAdjusterProps> = ({
  brightness,
  contrast,
  rotation,
  scale,
  onSettingChange
}) => {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex justify-between mb-2">
          <Label>Brightness: {brightness}%</Label>
        </div>
        <Slider
          value={[brightness]}
          min={0}
          max={200}
          step={1}
          onValueChange={(value) => onSettingChange("brightness", value[0])}
        />
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <Label>Contrast: {contrast}%</Label>
        </div>
        <Slider
          value={[contrast]}
          min={0}
          max={200}
          step={1}
          onValueChange={(value) => onSettingChange("contrast", value[0])}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Rotation: {rotation}°</Label>
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="icon"
              className="w-8 h-8"
              onClick={() => onSettingChange("rotation", Math.max(rotation - 90, -360))}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="w-8 h-8"
              onClick={() => onSettingChange("rotation", Math.min(rotation + 90, 360))}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Slider
          value={[rotation]}
          min={-360}
          max={360}
          step={1}
          onValueChange={(value) => onSettingChange("rotation", value[0])}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Zoom: {scale}%</Label>
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="icon"
              className="w-8 h-8"
              onClick={() => onSettingChange("scale", Math.max(scale - 10, 10))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="w-8 h-8"
              onClick={() => onSettingChange("scale", Math.min(scale + 10, 200))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Slider
          value={[scale]}
          min={10}
          max={200}
          step={1}
          onValueChange={(value) => onSettingChange("scale", value[0])}
        />
      </div>
    </div>
  );
};

export default ImageAdjuster;
