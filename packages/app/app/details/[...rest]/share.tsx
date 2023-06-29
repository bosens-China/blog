import Image from 'next/image';

export const Share = () => {
  return (
    <div className="qzhai-post-like uk-flex uk-flex-between">
      <div className="uk-flex ">
        <button type="button" className="qzhai-like uk-button uk-button-link uk-margin-right  uk-flex uk-flex-middle  ">
          <i className="qzf qzf-xin" />
          <span className="qzhai-like-num"> 0</span>
        </button>
      </div>
      <div className="uk-text-right uk-flex-auto uk-flex uk-flex-right">
        <ul className="uk-iconnav qzhai-share ">
          <li>
            <span> 分享:</span>
          </li>
          <li>
            <a
              href="//service.weibo.com/share/share.php?url=https%3A%2F%2Fzbl.cc%2F1892.html&type=button&language=zh_cn&title=%E3%80%902023%E4%B8%B4%E6%B2%82%E7%90%85%E7%90%8A%E4%BA%91%E9%9B%80%E9%9F%B3%E4%B9%90%E8%8A%82%E3%80%91%E8%BF%99%E7%A7%8D%E7%BB%8F%E5%8E%86%EF%BC%8C%E6%9C%89%E4%B8%80%E6%AC%A1%E5%B0%B1%E5%A4%9F%E4%BA%86%EF%BC%8C%E5%A4%9F%E5%A4%9F%E7%9A%84%E4%BA%86%E3%80%82%0D%0A%0D%0A%5B...%5D&searchPic=true"
              className="qzhai-logos  qzhai-logos-weibo"
              target="_blank"
            />
          </li>
          <li>
            <a
              href="javascript:;"
              className="qzhai-logos qzhai-logos-wechat"
              aria-haspopup="true"
              aria-expanded="false"
            />
            <div uk-drop="pos: top-center" className="qzhai-share-weixin uk-drop">
              <div className="uk-card uk-card-small">
                <Image
                  src="https://zbl.cc/wp-content/plugins/capsule-qzhai/extend/share/qrCode.php?data=https%3A%2F%2Fzbl.cc%2F1892.html"
                  ul-img=""
                  alt=""
                />
              </div>
            </div>
          </li>
          <li>
            <a
              href="https://connect.qq.com/widget/shareqq/index.html?url=https%3A%2F%2Fzbl.cc%2F1892.html&title=2023%E4%B8%B4%E6%B2%82%E7%90%85%E7%90%8A%E4%BA%91%E9%9B%80%E9%9F%B3%E4%B9%90%E8%8A%82&summary=%E8%BF%99%E7%A7%8D%E7%BB%8F%E5%8E%86%EF%BC%8C%E6%9C%89%E4%B8%80%E6%AC%A1%E5%B0%B1%E5%A4%9F%E4%BA%86%EF%BC%8C%E5%A4%9F%E5%A4%9F%E7%9A%84%E4%BA%86%E3%80%82%0D%0A%0D%0A%5B...%5D"
              className="qzhai-logos  qzhai-logos-qq"
              target="_blank"
            />
          </li>
        </ul>
      </div>
    </div>
  );
};
