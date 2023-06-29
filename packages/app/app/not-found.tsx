import { Content } from '@/layout/content';

export default function NotFound() {
  return (
    <Content>
      <div className="qzhai-main-content uk-card uk-card-default">
        <div className="uk-card-body uk-flex-center ">
          <div className="qzhai-content qzhai-content-404">
            <div className="qzhai-empty qzhai-empty-404 uk-flex uk-flex-column uk-flex-middle uk-flex-center">
              <i className="qzf qzf-404"></i>
              <span> 4 0 4 </span>
            </div>
          </div>
        </div>
      </div>
    </Content>
  );
}
