import { WAREHOUSE_ADDRESS } from '@blog/pull-data/config';

export const Filings = () => {
  return (
    <div className="qzhai-footer-info uk-flex uk-flex-center">
      <a href={WAREHOUSE_ADDRESS} target="_blank" className="Record">
        Blog 仓库地址
      </a>
    </div>
  );
};
