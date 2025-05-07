import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { 
  Download, 
  Image as ImageIcon, 
  RotateCcw, 
  RotateCw, 
  Plus, 
  Minus,
  Share,
  Facebook,
  Instagram,
  MessageSquare,
  Layers
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MemeTemplateSelector from './MemeTemplateSelector';
import TextEditor from './TextEditor';
import ImageAdjuster from './ImageAdjuster';
import { useLocalStorage } from '@/hooks/use-local-storage';
import ImageOverlayEditor from './ImageOverlayEditor';

export type TextItem = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  outline: boolean;
  outlineColor: string;
  fontFamily: string;
  isMemeStyle: boolean;
};

export type ImageOverlayItem = {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  layerIndex: number;
  name?: string;
};

export type MemeState = {
  image: string | null;
  texts: TextItem[];
  imageOverlays: ImageOverlayItem[];
  brightness: number;
  contrast: number;
  rotation: number;
  scale: number;
};

const defaultMemeState: MemeState = {
  image: null,
  texts: [],
  imageOverlays: [],
  brightness: 100,
  contrast: 100,
  rotation: 0,
  scale: 100
};

// Helper function to generate a unique ID
const generateId = (): string => {
  // Use crypto.randomUUID() if available, otherwise fallback to a simple random string
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};

const MemeEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayFileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("image");
  const [memeState, setMemeState] = useLocalStorage<MemeState>("meme-factory-state", defaultMemeState);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  // If image has been loaded, restore from localStorage
  useEffect(() => {
    if (memeState.image) {
      setLocalImage(memeState.image);
    }
  }, [memeState.image]);

  // Initialize default texts if needed
  useEffect(() => {
    if (localImage && memeState.texts.length === 0) {
      // Add default top and bottom text
      addDefaultTexts();
    }
  }, [localImage]);

  // Clear any cached templates (add this)
  useEffect(() => {
    localStorage.removeItem("meme_templates_database");
    localStorage.removeItem("meme_templates_version");
  }, []);

  const addDefaultTexts = () => {
    const newTexts: TextItem[] = [
      {
        id: generateId(),
        text: "TOP TEXT",
        x: 50, // center percentage
        y: 10, // top percentage
        fontSize: 36,
        color: "#FFFFFF",
        outline: true,
        outlineColor: "#000000",
        fontFamily: "impact",
        isMemeStyle: true
      },
      {
        id: generateId(),
        text: "BOTTOM TEXT",
        x: 50, // center percentage
        y: 90, // bottom percentage
        fontSize: 36,
        color: "#FFFFFF",
        outline: true,
        outlineColor: "#000000",
        fontFamily: "impact",
        isMemeStyle: true
      }
    ];

    setMemeState({
      ...memeState,
      texts: newTexts
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setLocalImage(imageDataUrl);
        setMemeState({
          ...memeState,
          image: imageDataUrl,
          texts: []  // Reset texts for new image
        });
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOverlayImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Convert FileList to Array for easier processing
    const filesArray = Array.from(files);
    
    // Create a copy of the current overlays to add to
    const newOverlays = [...(memeState.imageOverlays || [])];
    let processedCount = 0;
    
    // Process each file
    filesArray.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        
        // Create new overlay
        const newOverlay: ImageOverlayItem = {
          id: generateId(),
          src: imageDataUrl,
          x: 50, // center percentage
          y: 50, // center percentage
          width: 100, // pixels or percentage based on implementation
          height: 100, // pixels or percentage based on implementation
          rotation: 0,
          layerIndex: newOverlays.length + index,
          name: file.name,
        };
        
        newOverlays.push(newOverlay);
        processedCount++;
        
        // Only update state and show toast when all files are processed
        if (processedCount === filesArray.length) {
          setMemeState({
            ...memeState,
            imageOverlays: newOverlays
          });
          
          // Select the last added overlay
          setSelectedOverlayId(newOverlays[newOverlays.length - 1].id);
          
          const message = filesArray.length === 1 
            ? "Image overlay added!" 
            : `${filesArray.length} image overlays added!`;
          toast.success(message);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset the file input value to allow selecting the same files again
    if (overlayFileInputRef.current) {
      overlayFileInputRef.current.value = '';
    }
  };

  const handleUrlImport = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      try {
        // Create an Image instance properly
        const img = document.createElement('img');
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          
          setLocalImage(dataUrl);
          setMemeState({
            ...memeState,
            image: dataUrl,
            texts: []
          });
          toast.success("Image imported successfully!");
        };
        img.onerror = () => {
          toast.error("Failed to load image. Please check the URL or try another image.");
        };
        img.src = url;
      } catch (error) {
        toast.error("Failed to import image.");
      }
    }
  };

  const handleOverlayUrlImport = () => {
    const url = prompt("Enter image URL for overlay:");
    if (url) {
      try {
        // Create an Image instance properly
        const img = document.createElement('img');
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          
          addImageOverlay(dataUrl, url.split('/').pop());
        };
        img.onerror = () => {
          toast.error("Failed to load overlay image. Please check the URL or try another image.");
        };
        img.src = url;
      } catch (error) {
        toast.error("Failed to import overlay image.");
      }
    }
  };

  const handleTemplateSelect = (templateUrl: string) => {
    setLocalImage(templateUrl);
    setMemeState({
      ...memeState,
      image: templateUrl,
      texts: []
    });
    toast.success("Template selected!");
    setActiveTab("text");
  };

  const handleAddText = () => {
    const newText: TextItem = {
      id: generateId(),
      text: "New Text",
      x: 50,
      y: 50,
      fontSize: 24,
      color: "#FFFFFF",
      outline: true,
      outlineColor: "#000000",
      fontFamily: "impact",
      isMemeStyle: true
    };

    setMemeState({
      ...memeState,
      texts: [...memeState.texts, newText]
    });
  };

  const handleTextChange = (id: string, updates: Partial<TextItem>) => {
    setMemeState({
      ...memeState,
      texts: memeState.texts.map(text => 
        text.id === id ? { ...text, ...updates } : text
      )
    });
  };

  const handleOverlayChange = (id: string, updates: Partial<ImageOverlayItem>) => {
    setMemeState({
      ...memeState,
      imageOverlays: memeState.imageOverlays.map(overlay => 
        overlay.id === id ? { ...overlay, ...updates } : overlay
      )
    });
  };

  const handleDeleteText = (id: string) => {
    setMemeState({
      ...memeState,
      texts: memeState.texts.filter(text => text.id !== id)
    });
  };

  const handleDeleteOverlay = (id: string) => {
    setMemeState({
      ...memeState,
      imageOverlays: memeState.imageOverlays.filter(overlay => overlay.id !== id)
    });
    if (selectedOverlayId === id) {
      setSelectedOverlayId(null);
    }
  };

  const handleDuplicateOverlay = (id: string) => {
    const overlayToDuplicate = memeState.imageOverlays.find(overlay => overlay.id === id);
    if (overlayToDuplicate) {
      const newOverlay: ImageOverlayItem = {
        ...overlayToDuplicate,
        id: generateId(),
        x: overlayToDuplicate.x + 5,
        y: overlayToDuplicate.y + 5,
        layerIndex: memeState.imageOverlays.length
      };

      setMemeState({
        ...memeState,
        imageOverlays: [...memeState.imageOverlays, newOverlay]
      });
      
      setSelectedOverlayId(newOverlay.id);
      toast.success("Image overlay duplicated!");
    }
  };

  const updateImageSettings = (setting: keyof MemeState, value: number) => {
    setMemeState({
      ...memeState,
      [setting]: value
    });
  };

  const bringOverlayForward = (id: string) => {
    const overlaysWithUpdatedIndices = [...memeState.imageOverlays]
      .sort((a, b) => a.layerIndex - b.layerIndex)
      .map((overlay, index) => ({
        ...overlay,
        layerIndex: index
      }));
      
    const overlayIndex = overlaysWithUpdatedIndices.findIndex(o => o.id === id);
    
    if (overlayIndex < overlaysWithUpdatedIndices.length - 1) {
      // Swap with next item
      const temp = overlaysWithUpdatedIndices[overlayIndex].layerIndex;
      overlaysWithUpdatedIndices[overlayIndex].layerIndex = overlaysWithUpdatedIndices[overlayIndex + 1].layerIndex;
      overlaysWithUpdatedIndices[overlayIndex + 1].layerIndex = temp;
    }
    
    setMemeState({
      ...memeState,
      imageOverlays: overlaysWithUpdatedIndices
    });
  };
  
  const sendOverlayBackward = (id: string) => {
    const overlaysWithUpdatedIndices = [...memeState.imageOverlays]
      .sort((a, b) => a.layerIndex - b.layerIndex)
      .map((overlay, index) => ({
        ...overlay,
        layerIndex: index
      }));
      
    const overlayIndex = overlaysWithUpdatedIndices.findIndex(o => o.id === id);
    
    if (overlayIndex > 0) {
      // Swap with previous item
      const temp = overlaysWithUpdatedIndices[overlayIndex].layerIndex;
      overlaysWithUpdatedIndices[overlayIndex].layerIndex = overlaysWithUpdatedIndices[overlayIndex - 1].layerIndex;
      overlaysWithUpdatedIndices[overlayIndex - 1].layerIndex = temp;
    }
    
    setMemeState({
      ...memeState,
      imageOverlays: overlaysWithUpdatedIndices
    });
  };

  const renderMemeToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !localImage) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Create an Image instance properly
    const img = document.createElement('img');
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Reset canvas and apply canvas dimensions based on image
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply rotation
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((memeState.rotation * Math.PI) / 180);
      
      // Apply scale
      const scale = memeState.scale / 100;
      ctx.scale(scale, scale);
      
      // Draw image with filters
      ctx.filter = `brightness(${memeState.brightness}%) contrast(${memeState.contrast}%)`;
      ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
      
      // Reset transformations
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = 'none';
      
      // Draw image overlays in order of layerIndex
      const sortedOverlays = [...memeState.imageOverlays].sort((a, b) => a.layerIndex - b.layerIndex);
      
      sortedOverlays.forEach(overlay => {
        const overlayImg = new Image();
        overlayImg.onload = () => {
          // Calculate position based on percentages
          const x = (overlay.x / 100) * canvas.width;
          const y = (overlay.y / 100) * canvas.height;
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((overlay.rotation * Math.PI) / 180);
          
          // Draw the overlay image centered at its position
          ctx.drawImage(
            overlayImg, 
            -overlay.width / 2, 
            -overlay.height / 2, 
            overlay.width, 
            overlay.height
          );
          
          // Highlight selected overlay
          if (selectedOverlayId === overlay.id) {
            ctx.strokeStyle = '#4287f5';
            ctx.lineWidth = 2;
            ctx.strokeRect(-overlay.width / 2, -overlay.height / 2, overlay.width, overlay.height);
          }
          
          ctx.restore();
        };
        overlayImg.src = overlay.src;
      });
      
      // Draw texts
      memeState.texts.forEach(textItem => {
        if (textItem.isMemeStyle) {
          // Meme style text with outline
          ctx.font = `${textItem.fontSize}px ${textItem.fontFamily}, Impact, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Calculate position based on percentages
          const x = (textItem.x / 100) * canvas.width;
          const y = (textItem.y / 100) * canvas.height;
          
          if (textItem.outline) {
            ctx.strokeStyle = textItem.outlineColor;
            ctx.lineWidth = textItem.fontSize / 15;
            ctx.strokeText(textItem.text.toUpperCase(), x, y);
          }
          
          ctx.fillStyle = textItem.color;
          ctx.fillText(textItem.text.toUpperCase(), x, y);
        } else {
          // Regular text
          ctx.font = `${textItem.fontSize}px ${textItem.fontFamily}, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = textItem.color;
          
          // Calculate position based on percentages
          const x = (textItem.x / 100) * canvas.width;
          const y = (textItem.y / 100) * canvas.height;
          
          ctx.fillText(textItem.text, x, y);
        }
      });
    };
    
    img.src = localImage;
  };

  // Render the meme whenever the state changes
  useEffect(() => {
    renderMemeToCanvas();
  }, [localImage, memeState, selectedOverlayId]);

  const downloadMeme = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = "my-meme.png";
      link.href = canvasRef.current.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Meme downloaded!");
    }
  };

  const shareMeme = async () => {
    try {
      if (canvasRef.current) {
        const blob = await new Promise<Blob>((resolve) => {
          canvasRef.current!.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/png');
        });
        
        // Web Share API (mobile-first approach)
        if (navigator.share) {
          try {
            await navigator.share({
              files: [new File([blob], 'meme.png', { type: 'image/png' })],
              title: 'Check out my meme!',
            });
            toast.success("Meme shared successfully!");
            return;
          } catch (error) {
            console.log("Share API failed, falling back to alternatives", error);
            // Continue to fallback options
          }
        }
        
        // Fallback: Create a sharable URL
        const url = URL.createObjectURL(blob);
        
        // Copy to clipboard as fallback
        navigator.clipboard.writeText(url).then(() => {
          toast.success("Image URL copied to clipboard!");
        }).catch(() => {
          // If clipboard fails too, open in new tab as last resort
          window.open(url, '_blank');
          toast.success("Meme opened in new tab!");
        });
      }
    } catch (error) {
      toast.error("Failed to share meme");
      console.error("Share failed:", error);
    }
  };

  const shareToFacebook = async () => {
    try {
      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL("image/png");
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&picture=${encodeURIComponent(dataUrl)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        toast.success("Opening Facebook share dialog");
      }
    } catch (error) {
      toast.error("Failed to share to Facebook");
    }
  };

  const shareToWhatsapp = async () => {
    try {
      if (canvasRef.current) {
        const blob = await new Promise<Blob>((resolve) => {
          canvasRef.current!.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/png');
        });
        
        const url = URL.createObjectURL(blob);
        const shareUrl = `https://wa.me/?text=Check out my meme! ${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank');
        toast.success("Opening WhatsApp");
      }
    } catch (error) {
      toast.error("Failed to share to WhatsApp");
    }
  };

  const shareToInstagram = () => {
    toast.info("To share to Instagram, download the image and upload it from your Instagram app");
    downloadMeme();
  };

  const resetMeme = () => {
    setMemeState(defaultMemeState);
    setLocalImage(null);
    toast.info("Meme editor reset");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-[1fr_300px] gap-6'}`}>
        {/* Canvas Area */}
        <div className="editor-panel flex flex-col items-center justify-center min-h-[400px]">
          {!localImage ? (
            <div className="flex flex-col items-center gap-4 p-6 animate-fade-in">
              <ImageIcon className="w-16 h-16 text-meme-primary mb-2" />
              <h3 className="text-xl font-semibold text-center">Start creating your meme</h3>
              <div className="flex flex-wrap justify-center gap-3">
                <Button 
                  variant="outline" 
                  className="btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Image
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-primary"
                  onClick={handleUrlImport}
                >
                  Import by URL
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-accent"
                  onClick={() => setActiveTab("templates")}
                >
                  Choose Template
                </Button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          ) : (
            <div className="relative w-full">
              <canvas 
                ref={canvasRef} 
                className="max-w-full mx-auto border border-gray-200 shadow-sm"
              ></canvas>
              <div className="flex justify-center mt-4 gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={downloadMeme}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={shareMeme}
                >
                  <Share className="w-4 h-4" />
                  Share
                </Button>
                
                {/* Social media share buttons */}
                <div className="flex gap-2 mt-2 w-full justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={shareToFacebook}
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white"
                    onClick={shareToWhatsapp}
                  >
                    <MessageSquare className="w-4 h-4" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white"
                    onClick={shareToInstagram}
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Hidden input for overlay images - Updated to support multiple files */}
          <input
            type="file"
            ref={overlayFileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleOverlayImageUpload}
          />
        </div>

        {/* Editor Controls */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="overlay">Stickers</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            <Card className="mt-2 p-4">
              <TabsContent value="image">
                {!localImage ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Upload an image or select a template to begin</p>
                  </div>
                ) : (
                  <ImageAdjuster
                    brightness={memeState.brightness}
                    contrast={memeState.contrast}
                    rotation={memeState.rotation}
                    scale={memeState.scale}
                    onSettingChange={updateImageSettings}
                  />
                )}
              </TabsContent>
              <TabsContent value="text">
                {!localImage ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Upload an image or select a template to add text</p>
                  </div>
                ) : (
                  <TextEditor
                    texts={memeState.texts}
                    onTextChange={handleTextChange}
                    onAddText={handleAddText}
                    onDeleteText={handleDeleteText}
                  />
                )}
              </TabsContent>
              <TabsContent value="overlay">
                {!localImage ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Upload an image or select a template to add stickers</p>
                  </div>
                ) : (
                  <ImageOverlayEditor
                    imageOverlays={memeState.imageOverlays}
                    selectedOverlayId={selectedOverlayId}
                    onSelectedOverlayChange={setSelectedOverlayId}
                    onOverlayChange={handleOverlayChange}
                    onAddOverlay={() => overlayFileInputRef.current?.click()}
                    onAddOverlayByUrl={handleOverlayUrlImport}
                    onDeleteOverlay={handleDeleteOverlay}
                    onDuplicateOverlay={handleDuplicateOverlay}
                    onBringForward={bringOverlayForward}
                    onSendBackward={sendOverlayBackward}
                  />
                )}
              </TabsContent>
              <TabsContent value="templates">
                <MemeTemplateSelector onSelect={handleTemplateSelect} />
              </TabsContent>
            </Card>
          </Tabs>
          
          {localImage && (
            <Button 
              variant="destructive" 
              className="mt-4 w-full"
              onClick={resetMeme}
            >
              Reset & Start Over
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemeEditor;
