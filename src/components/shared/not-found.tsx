import { Link } from '@tanstack/react-router';
import { Home, MapPinX } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="p-4 bg-slate-900 rounded-full border border-slate-800 shadow-xl">
        <MapPinX size={48} className="text-slate-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-100">Página não encontrada</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Oops! Parece que você se perdeu no espaço-tempo. A página que você está procurando não
          existe.
        </p>
      </div>

      <Button asChild variant="outline" className="border-slate-700 hover:bg-slate-800">
        <Link to="/">
          <Home className="mr-2 h-4 w-4" /> Voltar ao Início
        </Link>
      </Button>
    </div>
  );
}
