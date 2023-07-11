import { DetailedHTMLProps, FC, HTMLAttributes } from 'react';
import styles from './styles.module.scss';

type Props = React.PropsWithChildren & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const EmptyState: FC<Props> = (props) => {
  const { style } = props;
  return <div style={style} className={`qzf qzf-shafa ${styles.div}`}></div>;
};
