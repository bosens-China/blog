import resso from 'resso';
import { AnalyticsProps } from './utils/analytics';

export const store = resso<{
  analytics: AnalyticsProps | null;
}>({
  analytics: null,
});
