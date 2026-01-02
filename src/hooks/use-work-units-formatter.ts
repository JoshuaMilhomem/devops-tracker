import { useCallback } from 'react';

import { useAtomValue } from 'jotai';

import { calculateWorkUnits } from '@/lib/time-utils';
import { decimalSeparatorAtom } from '@/store/settings-atoms';

export function useWorkUnitFormatter() {
  const separator = useAtomValue(decimalSeparatorAtom);

  const format = useCallback(
    (ms: number) => {
      const rawValue = parseFloat(calculateWorkUnits(ms));

      if (separator === 'dot') {
        return rawValue.toFixed(2).replace(',', '.');
      }

      if (separator === 'comma') {
        return rawValue.toFixed(2).replace('.', ',');
      }

      return new Intl.NumberFormat(navigator.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(rawValue);
    },
    [separator]
  );

  return { format };
}
