export const Share = () => {
  return (
    <div className="qzhai-post-like uk-flex uk-flex-between">
      <div className="uk-flex">
        <button
          type="button"
          className="qzhai-like uk-button uk-button-link uk-margin-right uk-flex uk-flex-middle"
          data-id={1858}
        >
          <i className="qzf qzf-xin" />
          <span className="qzhai-like-num"> 0</span>
        </button>
      </div>
      <div className="uk-text-right uk-flex-auto uk-flex uk-flex-right">
        <ul className="uk-iconnav qzhai-share">
          <li>
            <span> 分享:</span>
          </li>
          <li>
            <a
              href="//service.weibo.com/share/share.php?url=https%3A%2F%2Fzbl.cc%2F1858.html&type=button&language=zh_cn&title=%E3%80%90%E5%AD%98%E6%A1%A3%EF%BC%9A%E8%A7%82%E6%A8%BE%E5%AE%A0%E7%B2%89%E8%8A%82+%E5%A5%BD%E9%B2%A4%E9%80%81%E5%A5%BD%E9%82%BB%E2%80%94%E2%80%94%E4%B8%87%E5%9F%8E%26%23038%3B%E5%84%92%E8%BE%B0%E4%B8%9A%E4%B8%BB%E5%AE%A0%E7%88%B1%E8%AE%A1%E5%88%92%E3%80%91%E6%B4%BB%E5%8A%A8%E5%90%AF%E5%8A%A8%E5%89%8D%E4%B8%89%E6%97%A5%E8%B4%B9%E7%94%A85700%E5%85%83%EF%BC%8C%E9%82%80%E7%BA%A6782%E7%BB%84%EF%BC%8C%E5%8A%A0%E5%BE%AE%E4%BF%A1420%E7%BB%84%EF%BC%8C%E6%B4%BB%E5%8A%A8%E6%96%B0%E8%AE%BF260%E7%BB%84%EF%BC%9B%E7%8E%B0%5B...%5D&searchPic=true"
              className="qzhai-logos qzhai-logos-weibo"
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
            <div
              uk-drop="pos: top-center"
              className="qzhai-share-weixin uk-drop"
            >
              <div className="uk-card uk-card-small">
                <img
                  src="https://zbl.cc/wp-content/plugins/capsule-qzhai/extend/share/qrCode.php?data=https%3A%2F%2Fzbl.cc%2F1858.html"
                  ul-img=""
                />
              </div>
            </div>
          </li>
          <li>
            <a
              href="https://connect.qq.com/widget/shareqq/index.html?url=https%3A%2F%2Fzbl.cc%2F1858.html&title=%E5%AD%98%E6%A1%A3%EF%BC%9A%E8%A7%82%E6%A8%BE%E5%AE%A0%E7%B2%89%E8%8A%82+%E5%A5%BD%E9%B2%A4%E9%80%81%E5%A5%BD%E9%82%BB%E2%80%94%E2%80%94%E4%B8%87%E5%9F%8E%26%23038%3B%E5%84%92%E8%BE%B0%E4%B8%9A%E4%B8%BB%E5%AE%A0%E7%88%B1%E8%AE%A1%E5%88%92&summary=%E6%B4%BB%E5%8A%A8%E5%90%AF%E5%8A%A8%E5%89%8D%E4%B8%89%E6%97%A5%E8%B4%B9%E7%94%A85700%E5%85%83%EF%BC%8C%E9%82%80%E7%BA%A6782%E7%BB%84%EF%BC%8C%E5%8A%A0%E5%BE%AE%E4%BF%A1420%E7%BB%84%EF%BC%8C%E6%B4%BB%E5%8A%A8%E6%96%B0%E8%AE%BF260%E7%BB%84%EF%BC%9B%E7%8E%B0%5B...%5D"
              className="qzhai-logos qzhai-logos-qq"
              target="_blank"
            />
          </li>
        </ul>
      </div>
    </div>
  );
};
