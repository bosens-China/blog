import { FC } from 'react';
import styles from './styles.module.scss';

type Props = React.PropsWithChildren;

export const EmptyState: FC<Props> = () => {
  return <div className={`qzf qzf-shafa ${styles.div}`}></div>;
};
