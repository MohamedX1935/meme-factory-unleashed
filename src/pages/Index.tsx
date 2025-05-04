
import React, { useState, useEffect } from 'react';
import MemeEditor from '@/components/MemeEditor';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';

const Index = () => {
  const [memeCount, setMemeCount] = useState<number>(0);

  // Simuler un compteur de mèmes créés (en production, ce serait lié à une API)
  useEffect(() => {
    const randomStartCount = Math.floor(Math.random() * 10000) + 25000;
    setMemeCount(randomStartCount);
    
    const interval = setInterval(() => {
      setMemeCount(prevCount => prevCount + Math.floor(Math.random() * 3) + 1);
    }, 30000); // Incrémenter toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-meme-primary to-meme-secondary py-6 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Image className="w-10 h-10 text-white mr-2" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Meme Factory<span className="text-meme-accent">Unleashed</span>
            </h1>
          </div>
          <div className="text-sm text-white/80">
            <span className="font-bold text-white">{memeCount.toLocaleString()}</span> memes created and counting!
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto py-6 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-meme-primary to-meme-accent">
            Create Epic Memes Instantly
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No sign-up, no watermarks, just pure meme creativity. 
            Upload an image or choose from popular templates.
          </p>
        </div>

        <MemeEditor />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 px-4 border-t">
        <div className="container mx-auto">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">© {new Date().getFullYear()} Meme Factory Unleashed</p>
            <p>Create and share memes without limitations, watermarks, or sign-ups.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
