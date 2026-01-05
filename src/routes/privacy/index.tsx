import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { PrivacyPolicyContent } from '@/components/shared/privacy-policy-content';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/privacy/')({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="gap-2 pl-0 hover:bg-transparent hover:text-blue-400"
            asChild
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Voltar para o App
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Central de Privacidade
          </h1>
          <p className="text-muted-foreground">
            Transparência total sobre como o DevOps Tracker processa seus dados.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 md:p-10 shadow-sm">
          <PrivacyPolicyContent />
        </div>
      </div>
    </div>
  );
}
