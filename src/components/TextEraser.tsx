
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { EraseRect } from './MemeEditor';

interface TextEraserProps {
  eraseRects: EraseRect[];
  onDeleteRect: (id: string) => void;
}

const TextEraser: React.FC<TextEraserProps> = ({ eraseRects, onDeleteRect }) => {
  return (
    <div className="space-y-2 max-h-[200px] overflow-y-auto">
      {eraseRects.map((rect, index) => (
        <div 
          key={rect.id}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-md border"
        >
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-xs font-medium mr-2">
              {index + 1}
            </span>
            <span className="text-sm">
              Zone {index + 1} ({Math.round(rect.width)}% × {Math.round(rect.height)}%)
            </span>
          </div>
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => onDeleteRect(rect.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default TextEraser;
