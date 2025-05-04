
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash } from 'lucide-react';
import { TextItem } from './MemeEditor';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface TextEditorProps {
  texts: TextItem[];
  onTextChange: (id: string, updates: Partial<TextItem>) => void;
  onAddText: () => void;
  onDeleteText: (id: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ texts, onTextChange, onAddText, onDeleteText }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">Text Elements</h3>
        <Button 
          size="sm" 
          variant="outline"
          className="flex items-center gap-1"
          onClick={onAddText}
        >
          <Plus className="w-4 h-4" /> Add Text
        </Button>
      </div>

      {texts.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">No text elements added yet</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={onAddText}
          >
            Add your first text
          </Button>
        </div>
      )}

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {texts.map((textItem) => (
          <Accordion type="single" collapsible key={textItem.id}>
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {textItem.text || "Text Element"}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <div>
                    <Label htmlFor={`text-${textItem.id}`}>Text Content</Label>
                    <Input 
                      id={`text-${textItem.id}`}
                      value={textItem.text} 
                      onChange={(e) => onTextChange(textItem.id, { text: e.target.value })}
                      placeholder="Enter text"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Font Style</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select 
                        value={textItem.fontFamily} 
                        onValueChange={(value) => onTextChange(textItem.id, { fontFamily: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Font Family" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="impact">Impact</SelectItem>
                          <SelectItem value="arial">Arial</SelectItem>
                          <SelectItem value="comic sans ms">Comic Sans</SelectItem>
                          <SelectItem value="times new roman">Times New Roman</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center space-x-2">
                        <Switch 
                          id={`meme-style-${textItem.id}`}
                          checked={textItem.isMemeStyle}
                          onCheckedChange={(checked) => onTextChange(textItem.id, { isMemeStyle: checked })}
                        />
                        <Label htmlFor={`meme-style-${textItem.id}`}>Meme Style</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Font Size: {textItem.fontSize}px</Label>
                    </div>
                    <Slider
                      value={[textItem.fontSize]}
                      min={12}
                      max={72}
                      step={1}
                      onValueChange={(value) => onTextChange(textItem.id, { fontSize: value[0] })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`color-${textItem.id}`}>Text Color</Label>
                      <div className="flex mt-1">
                        <Input 
                          id={`color-${textItem.id}`}
                          type="color"
                          className="w-10 h-10 p-1 rounded-l-md"
                          value={textItem.color}
                          onChange={(e) => onTextChange(textItem.id, { color: e.target.value })}
                        />
                        <Input 
                          className="rounded-l-none"
                          value={textItem.color}
                          onChange={(e) => onTextChange(textItem.id, { color: e.target.value })}
                        />
                      </div>
                    </div>

                    {textItem.outline && (
                      <div>
                        <Label htmlFor={`outline-${textItem.id}`}>Outline Color</Label>
                        <div className="flex mt-1">
                          <Input 
                            id={`outline-${textItem.id}`}
                            type="color"
                            className="w-10 h-10 p-1 rounded-l-md"
                            value={textItem.outlineColor}
                            onChange={(e) => onTextChange(textItem.id, { outlineColor: e.target.value })}
                          />
                          <Input 
                            className="rounded-l-none"
                            value={textItem.outlineColor}
                            onChange={(e) => onTextChange(textItem.id, { outlineColor: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="mb-2 block">Position X: {textItem.x}%</Label>
                      <Slider
                        value={[textItem.x]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => onTextChange(textItem.id, { x: value[0] })}
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block">Position Y: {textItem.y}%</Label>
                      <Slider
                        value={[textItem.y]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => onTextChange(textItem.id, { y: value[0] })}
                      />
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => onDeleteText(textItem.id)}
                  >
                    <Trash className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </div>
  );
};

export default TextEditor;
