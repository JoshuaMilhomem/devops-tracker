import { useAtom } from 'jotai';
import {
  Cloud,
  Download,
  Github,
  LinkIcon,
  Loader2,
  LogOut,
  Merge,
  MousePointerClick,
  RefreshCw,
  Settings,
  Unlink,
  Upload,
} from 'lucide-react';

import GoogleIcon from '@/assests/google';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useCloudSync } from '@/hooks/use-cloud-sync';
import { cn } from '@/lib/utils';
import {
  type DecimalSeparator,
  type SyncMode,
  decimalSeparatorAtom,
  syncModeAtom,
} from '@/store/settings-atoms';

import { Badge } from '../ui/badge';

export function SettingsModal() {
  const [separator, setSeparator] = useAtom(decimalSeparatorAtom);
  const [syncMode, setSyncMode] = useAtom(syncModeAtom);

  const {
    user,
    loginWithGoogle,
    loginWithGithub,
    linkGoogle,
    linkGithub,
    unlinkAccount,
    logout,
    loading: authLoading,
  } = useAuth();

  const { backup, restore, smartMerge, isSyncing } = useCloudSync(user?.uid);

  const options: { value: DecimalSeparator; label: string; example: string }[] = [
    { value: 'system', label: 'Padrão do Sistema', example: '1,50 ou 1.50' },
    { value: 'dot', label: 'Ponto (.)', example: '1.50' },
    { value: 'comma', label: 'Vírgula (,)', example: '1,50' },
  ];
  const isLinked = (providerId: string) =>
    user?.providerData.some((p) => p.providerId === providerId);

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
            Gerencie preferências e sincronização.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="cloud" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-950">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="cloud">Nuvem & Backup</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="py-4 space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-slate-300">Separador Decimal</h4>
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
                          Ex: <span className="font-mono">{option.example}</span>
                        </p>
                      </div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="cloud" className="py-4 space-y-4">
            {!user ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center border-2 border-dashed border-slate-800 rounded-lg">
                <Cloud className="h-12 w-12 text-slate-600" />
                <div className="space-y-1">
                  <h4 className="font-medium text-slate-200">Sincronização na Nuvem</h4>
                  <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
                    Faça login para salvar suas tarefas.
                  </p>
                </div>
                <div className="grid gap-3 w-full max-w-xs">
                  <Button
                    onClick={loginWithGoogle}
                    disabled={authLoading}
                    className="w-full bg-white text-slate-900 hover:bg-slate-200"
                  >
                    {authLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleIcon className="mr-2 h-4 w-4" />
                    )}{' '}
                    Entrar com Google
                  </Button>
                  <Button
                    onClick={loginWithGithub}
                    disabled={authLoading}
                    className="w-full bg-[#24292F] text-white hover:bg-[#24292F]/90"
                  >
                    {authLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Github className="mr-2 h-4 w-4" />
                    )}{' '}
                    Entrar com GitHub
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-700">
                      <AvatarImage src={user.photoURL || ''} />
                      <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-slate-200">{user.displayName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={logout} title="Sair">
                    <LogOut className="h-4 w-4 text-slate-500 hover:text-red-400" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Modo de Sincronização
                  </h4>
                  <RadioGroup
                    value={syncMode}
                    onValueChange={(val) => setSyncMode(val as SyncMode)}
                    className="grid grid-cols-2 gap-3"
                  >
                    <Label
                      htmlFor="mode-manual"
                      className={cn(
                        'flex flex-col items-center justify-center rounded-md border border-slate-800 bg-transparent p-3 hover:bg-slate-800/50 cursor-pointer transition-all gap-2 text-center h-24',
                        syncMode === 'manual' && 'border-blue-500 bg-blue-500/10'
                      )}
                    >
                      <RadioGroupItem value="manual" id="mode-manual" className="sr-only" />
                      <MousePointerClick className="h-5 w-5 text-slate-400" />
                      <div>
                        <span className="block font-bold text-sm text-slate-200">Manual</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          Clicar para salvar
                        </span>
                      </div>
                    </Label>
                    <Label
                      htmlFor="mode-auto"
                      className={cn(
                        'flex flex-col items-center justify-center rounded-md border border-slate-800 bg-transparent p-3 hover:bg-slate-800/50 cursor-pointer transition-all gap-2 text-center h-24',
                        syncMode === 'automatic' && 'border-blue-500 bg-blue-500/10'
                      )}
                    >
                      <RadioGroupItem value="automatic" id="mode-auto" className="sr-only" />
                      <RefreshCw className="h-5 w-5 text-slate-400" />
                      <div>
                        <span className="block font-bold text-sm text-slate-200">Automático</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          Salva ao alterar
                        </span>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Contas Vinculadas
                  </h4>
                  <div className="flex items-center justify-between p-3 rounded-md bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-1 rounded-full w-6 h-6 flex items-center justify-center">
                        <GoogleIcon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-200">Google</span>
                      {isLinked('google.com') && (
                        <Badge
                          variant="outline"
                          className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 text-[10px] h-5"
                        >
                          Conectado
                        </Badge>
                      )}
                    </div>
                    {isLinked('google.com') ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unlinkAccount('google.com')}
                        className="text-slate-500 hover:text-red-400 h-8 px-2"
                      >
                        <Unlink size={16} />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={linkGoogle}
                        className="h-8 text-xs border-slate-700 hover:bg-white hover:text-slate-900"
                      >
                        <LinkIcon size={14} className="mr-2" /> Conectar
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-md bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <Github className="w-6 h-6 text-white" />
                      <span className="text-sm font-medium text-slate-200">GitHub</span>
                      {isLinked('github.com') && (
                        <Badge
                          variant="outline"
                          className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 text-[10px] h-5"
                        >
                          Conectado
                        </Badge>
                      )}
                    </div>
                    {isLinked('github.com') ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unlinkAccount('github.com')}
                        className="text-slate-500 hover:text-red-400 h-8 px-2"
                      >
                        <Unlink size={16} />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={linkGithub}
                        className="h-8 text-xs border-slate-700 hover:bg-[#24292F] hover:text-white"
                      >
                        <LinkIcon size={14} className="mr-2" /> Conectar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col gap-1 border-slate-700 hover:bg-red-500/10 hover:border-red-500 hover:text-red-400"
                        disabled={isSyncing}
                      >
                        {isSyncing ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Upload className="h-5 w-5" />
                        )}
                        <span className="font-bold text-xs">Enviar</span>
                        <span className="text-[9px] text-muted-foreground font-normal">
                          Local ➔ Nuvem
                        </span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-950 border-slate-800 text-slate-200">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sobrescrever Nuvem?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso enviará seus dados locais para a nuvem,{' '}
                          <span className="text-red-400 font-bold">apagando permanentemente</span> o
                          que estiver salvo lá no momento.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => backup()}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Sim, Sobrescrever
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-1 border-slate-700 bg-slate-900 hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-400"
                    onClick={smartMerge}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Merge className="h-5 w-5" />
                    )}
                    <span className="font-bold text-xs">Mesclar</span>
                    <span className="text-[9px] text-muted-foreground font-normal">
                      Unir Local + Nuvem
                    </span>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col gap-1 border-slate-700 hover:bg-red-500/10 hover:border-red-500 hover:text-red-400"
                        disabled={isSyncing}
                      >
                        {isSyncing ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Download className="h-5 w-5" />
                        )}
                        <span className="font-bold text-xs">Baixar</span>
                        <span className="text-[9px] text-muted-foreground font-normal">
                          Nuvem ➔ Local
                        </span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-950 border-slate-800 text-slate-200">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Substituir Local?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso baixará os dados da nuvem,{' '}
                          <span className="text-red-400 font-bold">
                            apagando suas tarefas locais
                          </span>{' '}
                          atuais.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={restore}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Sim, Substituir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
