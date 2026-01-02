import { useAtom } from 'jotai';
import { Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { type DecimalSeparator, decimalSeparatorAtom } from '@/store/settings-atoms';

export function SettingsModal() {
  const [separator, setSeparator] = useAtom(decimalSeparatorAtom);

  const options: { value: DecimalSeparator; label: string; example: string }[] = [
    { value: 'system', label: 'Padrão do Sistema', example: '1,50 ou 1.50' },
    { value: 'dot', label: 'Ponto (.)', example: '1.50' },
    { value: 'comma', label: 'Vírgula (,)', example: '1,50' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription className="text-slate-400">
            Personalize como os dados são formatados para cópia.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-slate-300">Separador Decimal (Work Units)</h4>

            <RadioGroup
              value={separator}
              onValueChange={(val) => setSeparator(val as DecimalSeparator)}
              className="grid gap-3"
            >
              {options.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    'flex items-center justify-between rounded-md border border-slate-800 bg-transparent p-4 hover:bg-slate-800/50 cursor-pointer transition-all',

                    '[&:has([data-state=checked])]:border-blue-500 [&:has([data-state=checked])]:bg-blue-500/10'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-slate-200">
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-500">
                        Exemplo: <span className="font-mono text-slate-400">{option.example}</span>
                      </p>
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
