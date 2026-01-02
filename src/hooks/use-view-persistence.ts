import { useEffect } from 'react';

import { useSetAtom } from 'jotai';
import { type WritableAtom } from 'jotai';

/**
 * Apenas observa a URL e salva no átomo.
 * NÃO realiza navegação nem restauração.
 */
export function useViewPersistence<T>(searchParams: T, atom: WritableAtom<T | null, [T], void>) {
  const setSavedState = useSetAtom(atom);

  useEffect(() => {
    setSavedState(searchParams);
  }, [searchParams, setSavedState]);
}
