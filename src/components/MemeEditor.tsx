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
  MessageSquare
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MemeTemplateSelector from './MemeTemplateSelector';
import TextEditor from './TextEditor';
import ImageAdjuster from './ImageAdjuster';
import { useLocalStorage } from '@/hooks/use-local-storage';

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

export type MemeState = {
  image: string | null;
  texts: TextItem[];
  brightness: number;
  contrast: number;
  rotation: number;
  scale: number;
};

const defaultMemeState: MemeState = {
  image: null,
  texts: [],
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
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("image");
  const [memeState, setMemeState] = useLocalStorage<MemeState>("meme-factory-state", defaultMemeState);
  const [localImage, setLocalImage] = useState<string | null>(null);

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
    const file = event.target.files?.[0];
    if (file) {
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

  const handleDeleteText = (id: string) => {
    setMemeState({
      ...memeState,
      texts: memeState.texts.filter(text => text.id !== id)
    });
  };

  const updateImageSettings = (setting: keyof MemeState, value: number) => {
    setMemeState({
      ...memeState,
      [setting]: value
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
      
      // Reset transformations for text
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = 'none';
      
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
  }, [localImage, memeState]);

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
        </div>

        {/* Editor Controls */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
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
