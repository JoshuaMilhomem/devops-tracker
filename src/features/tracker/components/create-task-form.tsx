import { useState } from 'react';

import { Check, ChevronsUpDown, Palette, Plus, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types';

const TAG_COLORS = [
  'bg-slate-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-lime-600',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-rose-500',
];

interface CreateTaskFormProps {
  onCreate: (name: string, desc: string, tags: Tag[]) => void;
  availableTags: Tag[];
}

export function CreateTaskForm({ onCreate, availableTags }: CreateTaskFormProps) {
  const [form, setForm] = useState({ name: '', desc: '' });
  const [tags, setTags] = useState<Tag[]>([]);

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const [view, setView] = useState<'select' | 'color'>('select');
  const [pendingTagName, setPendingTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onCreate(form.name, form.desc, tags);
    setForm({ name: '', desc: '' });
    setTags([]);
    setInputValue('');
  };
  const handleSelectTag = (tag: Tag) => {
    if (!tags.some((t) => t.label === tag.label)) {
      setTags([...tags, tag]);
    }
    setOpen(false);
    setInputValue('');
  };

  const handleRemoveTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  const startCreation = () => {
    setPendingTagName(inputValue);
    setView('color');
  };

  const finishCreation = () => {
    const newTag: Tag = {
      id: crypto.randomUUID(),
      label: pendingTagName.trim(),
      color: selectedColor,
    };
    handleSelectTag(newTag);

    setView('select');
    setPendingTagName('');
    setInputValue('');
  };

  const selectableTags = availableTags.filter(
    (tag) => !tags.some((selected) => selected.label === tag.label)
  );

  return (
    <Card className="border-slate-800 bg-slate-900 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Plus size={18} className="text-blue-500" /> Nova Tarefa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Input
            placeholder="Nome da Atividade"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500"
          />
        </div>
        <div>
          <Textarea
            placeholder="Descrição (Opcional)"
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            className="bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 resize-none min-h-20 focus-visible:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                className={cn(
                  tag.color,
                  'text-white border-0 hover:opacity-90 gap-1 pr-1 transition-all'
                )}
              >
                {tag.label}
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:bg-black/20 rounded-full p-0.5 ml-1"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>

          <Popover
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) {
                setView('select');
                setInputValue('');
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                {tags.length > 0 ? 'Adicionar mais tags...' : 'Selecionar ou criar tags...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[300px] p-0 bg-slate-900 border-slate-700" align="start">
              {view === 'select' ? (
                <Command className="bg-slate-900 text-slate-200">
                  <CommandInput
                    placeholder="Pesquisar tags..."
                    value={inputValue}
                    onValueChange={setInputValue}
                    className="border-none focus:ring-0 text-slate-200 placeholder:text-slate-500"
                  />
                  <CommandList>
                    <CommandEmpty className="py-2 px-2 text-center text-sm">
                      {inputValue ? (
                        <button
                          onClick={startCreation}
                          className="flex items-center justify-center gap-2 w-full p-2 text-blue-400 hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <Plus size={14} />
                          Criar "{inputValue}"
                        </button>
                      ) : (
                        <span className="text-slate-500">Nenhuma tag encontrada.</span>
                      )}
                    </CommandEmpty>

                    <CommandGroup heading="Disponíveis">
                      {selectableTags.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          value={tag.label}
                          onSelect={() => handleSelectTag(tag)}
                          className="cursor-pointer hover:bg-slate-800 aria-selected:bg-slate-800"
                        >
                          <div className={cn('w-2 h-2 rounded-full mr-2', tag.color)} />
                          {tag.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>

                    {inputValue &&
                      !selectableTags.some(
                        (t) => t.label.toLowerCase() === inputValue.toLowerCase()
                      ) && (
                        <>
                          <CommandSeparator className="bg-slate-700" />
                          <CommandGroup>
                            <CommandItem
                              value={`create:${inputValue}`}
                              onSelect={startCreation}
                              className="cursor-pointer text-blue-400 hover:text-blue-300 aria-selected:text-blue-300"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Criar nova tag "{inputValue}"
                            </CommandItem>
                          </CommandGroup>
                        </>
                      )}
                  </CommandList>
                </Command>
              ) : (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                      <Palette size={14} className="text-blue-400" />
                      Cor para "{pendingTagName}"
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setView('select')}
                      className="h-6 w-6 p-0 text-slate-500 hover:text-white"
                    >
                      <X size={14} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          'w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center ring-offset-2 ring-offset-slate-900',
                          color,
                          selectedColor === color && 'ring-2 ring-white scale-110'
                        )}
                      >
                        {selectedColor === color && <Check size={12} className="text-white" />}
                      </button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={finishCreation}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Confirmar Criação
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Adicionar Tarefa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
