
import React from 'react';
import { Button } from "@/components/ui/button";
import { ImageOverlayItem } from "./MemeEditor";
import { 
  Trash2,
  Plus,
  RotateCw,
  MoveVertical,
  MoveHorizontal,
  Layers,
  Upload,
  Maximize,
  Minimize,
  Move
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImageOverlayEditorProps {
  imageOverlays: ImageOverlayItem[];
  selectedOverlayId: string | null;
  onSelectedOverlayChange: (id: string | null) => void;
  onOverlayChange: (id: string, updates: Partial<ImageOverlayItem>) => void;
  onAddOverlay: () => void;
  onAddOverlayByUrl: () => void;
  onDeleteOverlay: (id: string) => void;
  onDuplicateOverlay: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
}

const ImageOverlayEditor: React.FC<ImageOverlayEditorProps> = ({
  imageOverlays = [], // Fournir un tableau vide comme valeur par défaut
  selectedOverlayId,
  onSelectedOverlayChange,
  onOverlayChange,
  onAddOverlay,
  onAddOverlayByUrl,
  onDeleteOverlay,
  onDuplicateOverlay,
  onBringForward,
  onSendBackward
}) => {
  // S'assurer que imageOverlays est défini avant d'appeler find
  const selectedOverlay = imageOverlays?.find(overlay => overlay.id === selectedOverlayId) || null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onAddOverlay}
        >
          <Upload className="w-4 h-4" />
          Upload
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onAddOverlayByUrl}
        >
          <Plus className="w-4 h-4" />
          Add by URL
        </Button>
      </div>

      {/* List of current overlays */}
      <div className="max-h-[200px] overflow-y-auto border rounded-md p-2 space-y-2">
        {!imageOverlays || imageOverlays.length === 0 ? (
          <div className="text-center py-2 text-muted-foreground">
            No stickers or images added yet
          </div>
        ) : (
          imageOverlays.map((overlay) => (
            <div 
              key={overlay.id} 
              className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
                selectedOverlayId === overlay.id ? 'bg-muted border border-meme-primary' : 'hover:bg-muted/50'
              }`}
              onClick={() => onSelectedOverlayChange(overlay.id)}
            >
              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={overlay.src} 
                  alt={overlay.name || 'Overlay'} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium truncate">
                  {overlay.name || `Image ${imageOverlays.indexOf(overlay) + 1}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(overlay.width)}×{Math.round(overlay.height)} px
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteOverlay(overlay.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Adjustment controls for selected overlay */}
      {selectedOverlay && (
        <div className="space-y-4 pt-2 border-t mt-4">
          <h3 className="font-medium">Ajustements</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => onDuplicateOverlay(selectedOverlay.id)}
            >
              <Plus className="w-4 h-4" />
              Dupliquer
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-red-500 hover:text-red-700"
              onClick={() => onDeleteOverlay(selectedOverlay.id)}
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
          
          {/* Position controls */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Move className="w-4 h-4" />
              Position
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">X: {Math.round(selectedOverlay.x)}%</Label>
                <Slider
                  value={[selectedOverlay.x]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => {
                    onOverlayChange(selectedOverlay.id, { x: value });
                  }}
                />
              </div>
              <div>
                <Label className="text-xs">Y: {Math.round(selectedOverlay.y)}%</Label>
                <Slider
                  value={[selectedOverlay.y]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => {
                    onOverlayChange(selectedOverlay.id, { y: value });
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Size controls */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Maximize className="w-4 h-4" />
              Taille
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Largeur: {Math.round(selectedOverlay.width)}px</Label>
                <Slider
                  value={[selectedOverlay.width]}
                  min={10}
                  max={500}
                  step={1}
                  onValueChange={([value]) => {
                    onOverlayChange(selectedOverlay.id, { width: value });
                  }}
                />
              </div>
              <div>
                <Label className="text-xs">Hauteur: {Math.round(selectedOverlay.height)}px</Label>
                <Slider
                  value={[selectedOverlay.height]}
                  min={10}
                  max={500}
                  step={1}
                  onValueChange={([value]) => {
                    onOverlayChange(selectedOverlay.id, { height: value });
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  const newSize = {
                    width: Math.max(10, selectedOverlay.width * 1.1),
                    height: Math.max(10, selectedOverlay.height * 1.1)
                  };
                  onOverlayChange(selectedOverlay.id, newSize);
                }}
              >
                <Maximize className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  const newSize = {
                    width: Math.max(10, selectedOverlay.width * 0.9),
                    height: Math.max(10, selectedOverlay.height * 0.9)
                  };
                  onOverlayChange(selectedOverlay.id, newSize);
                }}
              >
                <Minimize className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Rotation control */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <RotateCw className="w-4 h-4" />
              Rotation: {Math.round(selectedOverlay.rotation)}°
            </Label>
            <Slider
              value={[selectedOverlay.rotation]}
              min={-180}
              max={180}
              step={1}
              onValueChange={([value]) => {
                onOverlayChange(selectedOverlay.id, { rotation: value });
              }}
            />
          </div>
          
          {/* Layer controls */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Ordre des calques
            </Label>
            <div className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onBringForward(selectedOverlay.id)}
              >
                Remonter
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onSendBackward(selectedOverlay.id)}
              >
                Descendre
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageOverlayEditor;
