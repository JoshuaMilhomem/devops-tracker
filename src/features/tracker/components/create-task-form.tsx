import { useState } from 'react';

import { Plus } from 'lucide-react';

import { TagSelector } from '@/components/shared/tag-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Tag } from '@/types';

interface CreateTaskFormProps {
  onCreate: (name: string, desc: string, sp: number, tags: Tag[]) => void;
}

export function CreateTaskForm({ onCreate }: CreateTaskFormProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [form, setForm] = useState({ name: '', desc: '', sp: '' });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onCreate(form.name, form.desc, Number(form.sp) || 0, tags);
    setForm({ name: '', desc: '', sp: '' });
    setTags([]);
  };

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

        <div className="pb-2">
          <TagSelector selectedTags={tags} onTagsChange={setTags} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <Input
              type="number"
              placeholder="SP"
              value={form.sp}
              onChange={(e) => setForm({ ...form, sp: e.target.value })}
              className="bg-slate-950 border-slate-700 text-slate-200 text-center px-1 focus-visible:ring-blue-500"
              title="Story Points"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            className="col-span-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
