import resso from 'resso';
import { AnalyticsProps } from './utils/analytics';

export type Theme = 'auto' | 'light' | 'dark';

export const store = resso<{
  analytics: AnalyticsProps | null;
  theme: Theme;
}>({
  analytics: null,
  theme: 'auto',
});
