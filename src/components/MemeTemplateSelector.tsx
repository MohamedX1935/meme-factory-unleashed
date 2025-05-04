
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { memeTemplates } from '@/data/meme-templates';

interface MemeTemplateSelectorProps {
  onSelect: (templateUrl: string) => void;
}

const MemeTemplateSelector: React.FC<MemeTemplateSelectorProps> = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter templates based on search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return memeTemplates;
    
    const query = searchQuery.toLowerCase();
    return memeTemplates.filter(template => 
      template.name.toLowerCase().includes(query)
    );
  }, [searchQuery, memeTemplates]);

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
      
      {filteredTemplates.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No templates found matching "{searchQuery}"</p>
      ) : (
        <>
          <h3 className="font-medium">
            {searchQuery ? `Results (${filteredTemplates.length})` : 'Popular Templates'}
          </h3>
          <ScrollArea className="h-[420px]">
            <div className="grid grid-cols-2 gap-2">
              {filteredTemplates.map((template) => (
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
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default MemeTemplateSelector;
