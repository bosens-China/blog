import resso from './utils/resso';
import { AnalyticsProps } from './utils/analytics';
import { deserialize, serialize } from 'seroval';

export type Theme = 'auto' | 'light' | 'dark';

const defaultValues: any = typeof window !== 'undefined' ? deserialize(localStorage.getItem('store') as any) : null;

export const store = resso<{
  analytics: AnalyticsProps | null;
  theme: Theme;
}>(
  defaultValues || {
    analytics: null,
    theme: 'auto',
  },
);

resso.watch((values) => {
  localStorage.setItem('store', serialize(values));
});
