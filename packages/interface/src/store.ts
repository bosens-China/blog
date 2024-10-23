import resso from './utils/resso';
import { AnalyticsProps } from './utils/analytics';
import { deserialize, serialize } from 'seroval';

export type Theme = 'auto' | 'light' | 'dark';

export type Device = 'computer' | 'tablet' | 'mobile';

const defaultValues: any = typeof window !== 'undefined' ? deserialize(localStorage.getItem('store') as any) : null;

export const store = resso<{
  analytics: AnalyticsProps | null;
  theme: Theme;
  device: Device;
}>(
  defaultValues || {
    analytics: null,
    theme: 'auto',
    device: 'computer',
  },
);

resso.watch((values) => {
  localStorage.setItem('store', serialize(values));
});
