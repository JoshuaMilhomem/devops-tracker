import { useEffect, useState } from 'react';

import {
  type AuthProvider,
  type User,
  linkWithPopup,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  unlink,
} from 'firebase/auth';
import { toast } from 'sonner';

import { auth, githubProvider, googleProvider } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (provider: AuthProvider, providerName: string) => {
    try {
      await signInWithPopup(auth, provider);
      toast.success(`Bem-vindo(a)! Login com ${providerName} realizado.`);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast.error(
          'Email já cadastrado com outro provedor. Faça login com o método original e vincule a conta.'
        );
      } else {
        toast.error(`Erro ao entrar com ${providerName}.`);
      }
    }
  };

  const linkAccount = async (provider: AuthProvider, providerName: string) => {
    if (!auth.currentUser) return;
    try {
      await linkWithPopup(auth.currentUser, provider);
      toast.success(`${providerName} vinculado com sucesso!`);

      setUser({ ...auth.currentUser });
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/credential-already-in-use') {
        toast.error(`Esta conta do ${providerName} já está vinculada a outro usuário.`);
      } else {
        toast.error(`Erro ao vincular ${providerName}.`);
      }
    }
  };

  const unlinkAccount = async (providerId: string) => {
    if (!auth.currentUser) return;

    if (auth.currentUser.providerData.length === 1) {
      toast.warning('Você não pode remover seu único método de acesso.');
      return;
    }

    try {
      await unlink(auth.currentUser, providerId);
      toast.success('Conta desvinculada com sucesso.');
      setUser({ ...auth.currentUser });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao desvincular conta.');
    }
  };

  return {
    user,
    loading,
    loginWithGoogle: () => handleLogin(googleProvider, 'Google'),
    loginWithGithub: () => handleLogin(githubProvider, 'GitHub'),
    linkGoogle: () => linkAccount(googleProvider, 'Google'),
    linkGithub: () => linkAccount(githubProvider, 'GitHub'),
    unlinkAccount,
    logout: async () => {
      await signOut(auth);
      toast.success('Desconectado.');
    },
  };
}
