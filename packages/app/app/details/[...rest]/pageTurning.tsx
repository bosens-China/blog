import { articleDetails, obtainClassification } from '@/utils';
import { FC, useMemo } from 'react';
import Link from 'next/link';

interface Props {
  id: string;
  type?: string;
}

export const PageTurning: FC<Props> = ({ id, type }) => {
  const item = articleDetails(id);
  const data = obtainClassification(type);
  const index = data.indexOf(item as any);

  const [upper, lower] = useMemo(() => {
    return [index - 1 >= 0 ? data[index - 1] : null, index + 1 <= data.length ? data[index + 1] : null];
  }, [index, data]);

  return (
    <div className="qzhai-extension-post">
      <div className="uk-child-width-1-2 uk-grid" uk-grid="">
        <div className="uk-first-column">
          {!!upper && (
            <Link href={[`/details/${upper.id}`, type ? `/${type}` : ''].join('')}>
              <span>上一篇</span>
              <div>{upper.title}</div>
            </Link>
          )}
        </div>
        <div>
          {!!lower && (
            <Link href={[`/details/${lower.id}`, type ? `/${type}` : ''].join('')}>
              <span>下一篇</span>
              <div>{lower.title}</div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
