
import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memeTemplates } from '@/data/meme-templates';

interface MemeTemplateSelectorProps {
  onSelect: (templateUrl: string) => void;
}

const MemeTemplateSelector: React.FC<MemeTemplateSelectorProps> = ({ onSelect }) => {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">Popular Templates</h3>
      <ScrollArea className="h-[420px]">
        <div className="grid grid-cols-2 gap-2">
          {memeTemplates.map((template) => (
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
    </div>
  );
};

export default MemeTemplateSelector;
