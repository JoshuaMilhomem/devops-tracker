import { useState } from 'react';

import { Check, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Tag } from '@/types';

const PRESETS = [
  { label: 'Feature', color: 'bg-blue-500' },
  { label: 'Bugfix', color: 'bg-red-500' },
  { label: 'Refactor', color: 'bg-purple-500' },
  { label: 'Meeting', color: 'bg-yellow-500' },
  { label: 'Docs', color: 'bg-green-500' },
  { label: 'DevOps', color: 'bg-orange-500' },
];

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customTag, setCustomTag] = useState('');

  const toggleTag = (label: string, color: string) => {
    const exists = selectedTags.find((t) => t.label === label);
    if (exists) {
      onTagsChange(selectedTags.filter((t) => t.label !== label));
    } else {
      onTagsChange([...selectedTags, { id: crypto.randomUUID(), label, color }]);
    }
  };

  const addCustomTag = () => {
    if (!customTag.trim()) return;
    toggleTag(customTag, 'bg-slate-500');
    setCustomTag('');
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {selectedTags.map((tag) => (
        <Badge
          key={tag.id}
          className={`${tag.color} text-white hover:${tag.color}/80 pr-1 gap-1 transition-all`}
        >
          {tag.label}
          <button
            onClick={() => toggleTag(tag.label, tag.color)}
            className="hover:bg-black/20 rounded-full p-0.5"
          >
            <span className="sr-only">Remover</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </Badge>
      ))}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400"
          >
            <Plus size={12} className="mr-1" /> Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2 bg-slate-900 border-slate-800" align="start">
          <div className="space-y-2">
            <h4 className="font-medium text-xs text-slate-400 mb-2 px-1">Selecionar Tags</h4>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => {
                const isSelected = selectedTags.some((t) => t.label === preset.label);
                return (
                  <button
                    key={preset.label}
                    onClick={() => toggleTag(preset.label, preset.color)}
                    className={`
                      text-xs px-2 py-1.5 rounded flex items-center justify-between transition-colors
                      ${isSelected ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${preset.color}`} />
                      {preset.label}
                    </div>
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 mt-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Nova tag..."
                  className="h-7 text-xs bg-slate-950"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                />
                <Button size="icon" className="h-7 w-7" onClick={addCustomTag}>
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
