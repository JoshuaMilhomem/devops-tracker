import { atomWithStorage } from 'jotai/utils';

export type DecimalSeparator = 'system' | 'dot' | 'comma';

export const decimalSeparatorAtom = atomWithStorage<DecimalSeparator>(
  'devops-separator-pref',
  'system'
);
