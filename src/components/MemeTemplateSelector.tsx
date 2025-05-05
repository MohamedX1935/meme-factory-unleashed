

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader } from "lucide-react";
import { initialMemeTemplates, MemeTemplate } from '@/data/meme-templates';
import { loadAllTemplates } from '@/utils/template-loader';

interface MemeTemplateSelectorProps {
  onSelect: (templateUrl: string) => void;
}

const MemeTemplateSelector: React.FC<MemeTemplateSelectorProps> = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<MemeTemplate[]>(initialMemeTemplates);
  const [visibleTemplates, setVisibleTemplates] = useState<MemeTemplate[]>(initialMemeTemplates);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(20);
  const observerTarget = useRef<HTMLDivElement>(null);

  const TEMPLATES_PER_PAGE = 20;

  // Load all templates when component mounts
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const allTemplates = await loadAllTemplates();
        setTemplates(allTemplates);
        setVisibleTemplates(allTemplates.slice(0, TEMPLATES_PER_PAGE));
        setLoadedCount(TEMPLATES_PER_PAGE);
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Filter templates based on search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    
    const query = searchQuery.toLowerCase();
    return templates.filter(template => 
      template.name.toLowerCase().includes(query) || 
      (template.filename && template.filename.toLowerCase().includes(query)) ||
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }, [searchQuery, templates]);

  // Load more templates when user scrolls
  const loadMoreTemplates = useCallback(() => {
    if (loadedCount >= filteredTemplates.length) return;
    
    const nextBatchSize = Math.min(TEMPLATES_PER_PAGE, filteredTemplates.length - loadedCount);
    const newLoadedCount = loadedCount + nextBatchSize;
    
    setVisibleTemplates(filteredTemplates.slice(0, newLoadedCount));
    setLoadedCount(newLoadedCount);
  }, [filteredTemplates, loadedCount]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!observerTarget.current) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreTemplates();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(observerTarget.current);
    
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMoreTemplates, isLoading]);

  // Reset visible templates when search query changes
  useEffect(() => {
    setVisibleTemplates(filteredTemplates.slice(0, TEMPLATES_PER_PAGE));
    setLoadedCount(Math.min(TEMPLATES_PER_PAGE, filteredTemplates.length));
  }, [filteredTemplates]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Search templates..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="font-medium">
          {templates.length > initialMemeTemplates.length ? (
            <span className="text-meme-primary font-bold">{templates.length}+</span>
          ) : (
            <span>{templates.length}</span>
          )} Templates Available
        </h3>
        
        {isLoading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader className="h-3 w-3 mr-1 animate-spin" />
            Loading templates...
          </div>
        )}

        {filteredTemplates.length !== templates.length && !isLoading && (
          <div className="text-xs text-muted-foreground">
            Showing {filteredTemplates.length} results
          </div>
        )}
      </div>

      {filteredTemplates.length === 0 && !isLoading ? (
        <div className="text-center text-muted-foreground py-8 border border-dashed rounded-md">
          <p className="mb-2">No templates found matching "{searchQuery}"</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSearchQuery('')}
          >
            Clear search
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[420px]">
          <div className="grid grid-cols-2 gap-2">
            {visibleTemplates.map((template) => (
              <Card 
                key={template.id}
                className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
                onClick={() => onSelect(template.url)}
              >
                <div className="p-1">
                  <img 
                    src={template.url} 
                    alt={template.name} 
                    className="w-full h-auto object-cover rounded"
                    loading="lazy"
                  />
                  <p className="text-xs text-center mt-1 text-muted-foreground line-clamp-1">
                    {template.name}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Intersection observer target element */}
          {filteredTemplates.length > loadedCount && (
            <div 
              ref={observerTarget} 
              className="py-4 flex justify-center"
            >
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default MemeTemplateSelector;

