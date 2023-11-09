export const RelatedReading = () => {
  return (
    <div className="qzhai-related-articles uk-card uk-card-default uk-margin">
      <div className="uk-card-header">
        <div className="qzhai-card-header-title">相关阅读</div>
      </div>
      <div className="uk-card-body">
        <div
          uk-slider="autoplay: true; sets: true"
          className="uk-slider uk-slider-container"
        >
          <div
            className="uk-position-relative uk-visible-toggle uk-light"
            tabIndex={-1}
          >
            <ul
              className="uk-slider-items uk-child-width-1-4@s uk-child-width-1-2 uk-grid uk-grid-small"
              style={{ transform: "translate3d(-141.75px, 0px, 0px)" }}
            >
              <li tabIndex={-1} className="uk-active" style={{ order: 1 }}>
                <div className="uk-card uk-position-relative">
                  <div
                    className="img uk-background-cover"
                    data-src="https://zbl.cc/wp-content/uploads/2022/05/9FA65404-0E78-44CE-A280-380E6EC12904-scaled.jpeg"
                    uk-img=""
                    style={{
                      backgroundImage:
                        'url("https://zbl.cc/wp-content/uploads/2022/05/9FA65404-0E78-44CE-A280-380E6EC12904-scaled.jpeg")',
                    }}
                  />
                  <h3 className="uk-card-title uk-margin-small-top uk-margin-remove-bottom">
                    吾悦出手，齐鲁园广场也没来第二春
                  </h3>
                  <a href="https://zbl.cc/349.html" data-can-open={1} />
                </div>
              </li>
              <li tabIndex={-1} className="" style={{ order: 1 }}>
                <div className="uk-card uk-position-relative">
                  <div
                    className="img uk-background-cover"
                    data-src="https://zbl.cc/wp-content/uploads/2022/05/5DFD6C53-0483-444C-AAC3-E93B133E7B0D-scaled-500x375.jpeg"
                    uk-img=""
                    style={{
                      backgroundImage:
                        'url("https://zbl.cc/wp-content/uploads/2022/05/5DFD6C53-0483-444C-AAC3-E93B133E7B0D-scaled-500x375.jpeg")',
                    }}
                  />
                  <h3 className="uk-card-title uk-margin-small-top uk-margin-remove-bottom">
                    梦开始的地方
                  </h3>
                  <a href="https://zbl.cc/354.html" data-can-open={1} />
                </div>
              </li>
              <li tabIndex={-1} className="" style={{ order: 1 }}>
                <div className="uk-card uk-position-relative">
                  <div
                    className="img uk-background-cover"
                    data-src="https://zbl.cc/wp-content/uploads/2022/05/C166BC44-099D-422A-9734-7D6DEF5310EF-500x375.jpeg"
                    uk-img=""
                    style={{
                      backgroundImage:
                        'url("https://zbl.cc/wp-content/uploads/2022/05/C166BC44-099D-422A-9734-7D6DEF5310EF-500x375.jpeg")',
                    }}
                  />
                  <h3 className="uk-card-title uk-margin-small-top uk-margin-remove-bottom">
                    有人交房即办证，有人交房就维权
                  </h3>
                  <a href="https://zbl.cc/486.html" data-can-open={1} />
                </div>
              </li>
              <li tabIndex={-1} className="">
                <div className="uk-card uk-position-relative">
                  <div
                    className="img uk-background-cover"
                    data-src=""
                    uk-img=""
                  />
                  <h3 className="uk-card-title uk-margin-small-top uk-margin-remove-bottom">
                    眼下的房地产市场
                  </h3>
                  <a href="https://zbl.cc/624.html" data-can-open={1} />
                </div>
              </li>
              <li tabIndex={-1} className="uk-active">
                <div className="uk-card uk-position-relative">
                  <div
                    className="img uk-background-cover"
                    data-src="https://zbl.cc/wp-content/uploads/2023/03/WechatIMG5982-scaled-500x213.jpeg"
                    uk-img=""
                    style={{
                      backgroundImage:
                        'url("https://zbl.cc/wp-content/uploads/2023/03/WechatIMG5982-scaled-500x213.jpeg")',
                    }}
                  />
                  <h3 className="uk-card-title uk-margin-small-top uk-margin-remove-bottom">
                    存档：观樾府邻里植树节活动
                  </h3>
                  <a href="https://zbl.cc/1826.html" data-can-open={1} />
                </div>
              </li>
              <li tabIndex={-1} className="uk-active">
                <div className="uk-card uk-position-relative">
                  <div
                    className="img uk-background-cover"
                    data-src="https://zbl.cc/wp-content/uploads/2023/03/横版banner-scaled-500x213.jpeg"
                    uk-img=""
                    style={{
                      backgroundImage:
                        'url("https://zbl.cc/wp-content/uploads/2023/03/%E6%A8%AA%E7%89%88banner-scaled-500x213.jpeg")',
                    }}
                  />
                  <h3 className="uk-card-title uk-margin-small-top uk-margin-remove-bottom">
                    存档：国人大厦9.9元安家计划
                  </h3>
                  <a href="https://zbl.cc/1844.html" data-can-open={1} />
                </div>
              </li>
              <li tabIndex={-1} className="uk-active">
                <div className="uk-card uk-position-relative">
                  <div
                    className="img uk-background-cover"
                    data-src="https://zbl.cc/wp-content/uploads/2023/03/0.jpeg-500x282.jpg"
                    uk-img=""
                    style={{
                      backgroundImage:
                        'url("https://zbl.cc/wp-content/uploads/2023/03/0.jpeg-500x282.jpg")',
                    }}
                  />
                  <h3 className="uk-card-title uk-margin-small-top uk-margin-remove-bottom">
                    存档：#临沂万科美好计划#为爱助农 守护美好 我们在路上
                  </h3>
                  <a href="https://zbl.cc/1864.html" data-can-open={1} />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
