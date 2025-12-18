import { useState } from 'react';

import {
  CalendarDays,
  Check,
  ChevronsUpDown,
  Loader2,
  Palette,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { calculateWorkUnits } from '@/lib/time-utils';
import { cn } from '@/lib/utils';
import type { Tag, Task } from '@/types';

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

interface EditTaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  availableTags?: Tag[];
}

export const EditTaskModal = ({
  task,
  onClose,
  onSave,
  availableTags = [],
}: EditTaskModalProps) => {
  const [localTask, setLocalTask] = useState<Task | null>(task);

  const [prevTask, setPrevTask] = useState<Task | null>(task);

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [view, setView] = useState<'select' | 'color'>('select');
  const [pendingTagName, setPendingTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  if (task !== prevTask) {
    setPrevTask(task);
    setLocalTask(task);
    setInputValue('');
    setView('select');
  }

  if (!task || !localTask) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localTask);
  };

  const handleSelectTag = (tag: Tag) => {
    const currentTags = localTask.tags || [];
    if (!currentTags.some((t) => t.label === tag.label)) {
      setLocalTask({
        ...localTask,
        tags: [...currentTags, tag],
      });
    }
    setOpen(false);
    setInputValue('');
  };

  const handleRemoveTag = (id: string) => {
    setLocalTask({
      ...localTask,
      tags: (localTask.tags || []).filter((t) => t.id !== id),
    });
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
    (tag) => !(localTask.tags || []).some((selected) => selected.label === tag.label)
  );

  return (
    <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg overflow-visible">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>Faça alterações nos detalhes da tarefa abaixo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da Atividade</Label>
            <Input
              id="name"
              value={localTask.name}
              onChange={(e) => setLocalTask({ ...localTask, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Descrição</Label>
            <Textarea
              id="desc"
              value={localTask.description || ''}
              onChange={(e) => setLocalTask({ ...localTask, description: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          {/* --- TAG SELECTOR --- */}
          <div className="grid gap-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(localTask.tags || []).map((tag) => (
                <Badge key={tag.id} className={cn(tag.color, 'text-white border-0 gap-1 pr-1')}>
                  {tag.label}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="hover:bg-black/20 rounded-full p-0.5"
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
                  className="w-full justify-between bg-slate-950/50 border-slate-700 text-slate-300"
                >
                  {(localTask.tags || []).length > 0
                    ? 'Gerenciar tags...'
                    : 'Selecionar ou criar tags...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[400px] p-0 bg-slate-900 border-slate-700" align="start">
                {view === 'select' ? (
                  <Command className="bg-slate-900 text-slate-200">
                    <CommandInput
                      placeholder="Pesquisar tags..."
                      value={inputValue}
                      onValueChange={setInputValue}
                      className="border-none focus:ring-0"
                    />
                    <CommandList>
                      <CommandEmpty className="py-2 px-2 text-center text-sm">
                        {inputValue ? (
                          <button
                            type="button"
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
                            className="cursor-pointer aria-selected:bg-slate-800"
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
                                className="cursor-pointer text-blue-400 aria-selected:text-blue-300"
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
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setView('select')}
                        className="h-6 w-6 p-0"
                      >
                        <X size={14} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {TAG_COLORS.map((color) => (
                        <button
                          type="button"
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
                      type="button"
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const LogEditorModal = ({
  task,
  onClose,
  onAddInterval,
  onDeleteInterval,
  onUpdateInterval,
}: {
  task: Task | null;
  onClose: () => void;
  onAddInterval: (taskId: string) => void;
  onDeleteInterval: (taskId: string, intervalId: string) => void;
  onUpdateInterval: (
    taskId: string,
    intervalId: string,
    field: 'start' | 'end',
    value: string
  ) => void;
}) => {
  if (!task) return null;

  const handleDateChange = (intervalId: string, field: 'start' | 'end', inputValue: string) => {
    if (!inputValue) return;
    const localDate = new Date(inputValue);
    onUpdateInterval(task.id, intervalId, field, localDate.toISOString());
  };

  const toLocalInput = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);

    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const calculateTotal = (intervals: typeof task.intervals): number =>
    intervals.reduce(
      (sum, i) => sum + (i.end ? new Date(i.end).getTime() - new Date(i.start).getTime() : 0),
      0
    );

  const formatSessionTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Logs de Tempo
          </DialogTitle>
          <DialogDescription>
            Gerencie as sessões de tempo para{' '}
            <span className="font-medium text-foreground">{task.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 py-4 space-y-4">
          {task.intervals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <CalendarDays className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">Nenhum intervalo registrado.</p>
            </div>
          )}

          {task.intervals.map((interval, index) => {
            const sessionDuration = interval.end
              ? new Date(interval.end).getTime() - new Date(interval.start).getTime()
              : new Date().getTime() - new Date(interval.start).getTime();

            return (
              <div
                key={interval.id}
                className="bg-muted/40 p-4 rounded-lg border flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Sessão {index + 1}
                    </span>
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {formatSessionTime(sessionDuration)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteInterval(task.id, interval.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">Início</Label>
                    <Input
                      type="datetime-local"
                      value={toLocalInput(interval.start)}
                      onChange={(e) => handleDateChange(interval.id, 'start', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">Fim</Label>
                    {interval.end === null ? (
                      <div className="h-8 flex items-center px-3 text-xs text-primary bg-primary/5 border rounded-md italic gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" /> Em andamento...
                      </div>
                    ) : (
                      <Input
                        type="datetime-local"
                        value={toLocalInput(interval.end)}
                        onChange={(e) => handleDateChange(interval.id, 'end', e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onAddInterval(task.id)}
            className="w-full sm:w-auto"
          >
            Adicionar Intervalo Manual
          </Button>
          <div className="flex-1" />
          <div className="flex flex-col items-end px-2">
            <div className="text-sm font-bold">
              Total: {formatSessionTime(calculateTotal(task.intervals))}
            </div>
            <div className="text-xs text-muted-foreground">
              {calculateWorkUnits(calculateTotal(task.intervals))} WT
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
