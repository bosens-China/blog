export const Comment = () => {
  return (
    <>
      <div className=" uk-card uk-card-default uk-margin">
        <div className="uk-card-header">
          <div className="qzhai-card-header-title">评论</div>
        </div>
        <div id="qzhai_comments" className="qzhai-comment ">
          <div className="qzhai-comment-list-box">
            <div className="qzhai-empty qzhai-empty-comments">
              <i className="qzf qzf-shafa" />
              <span>还没有评论</span>
            </div>
            <ul className="uk-comment-list" id="qzhai-comment-list" />
          </div>
        </div>
      </div>
      <div id="qzhai_comment_form_box" className="uk-card uk-card-default uk-margin">
        <div className="hd">
          <span>
            发表评论
            <button type="button" uk-close="" className="uk-icon uk-close">
              <svg width={14} height={14} viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                <line fill="none" stroke="#000" strokeWidth="1.1" x1={1} y1={1} x2={13} y2={13} />
                <line fill="none" stroke="#000" strokeWidth="1.1" x1={13} y1={1} x2={1} y2={13} />
              </svg>
            </button>
          </span>
          <i>说点什么</i>
        </div>
        <div className="bd">
          <form
            method="post"
            action="https://zbl.cc/wp-comments-post.php"
            id="qzhai_comment_form"
            className="comment-form uk-grid-small uk-grid uk-grid-stack"
            uk-grid=""
          >
            <div className="uk-width-1-1">
              <textarea
                id="comment"
                className="qzhai-comment-textarea uk-textarea"
                name="comment"
                rows={3}
                defaultValue={''}
              />
            </div>
            <div className="uk-width-1-4@s">
              <div className="uk-inline uk-width-1-1">
                <span className="uk-form-icon qzf qzf-user" />
                <input id="author" className="uk-input" type="text" defaultValue="" placeholder="姓名" name="author" />
              </div>
            </div>
            <div className="uk-width-1-4@s">
              <div className="uk-inline uk-width-1-1">
                <span className="uk-form-icon qzf qzf-mail" />
                <input id="email" className="uk-input" type="text" defaultValue="" placeholder="邮箱" name="email" />
              </div>
            </div>
            <div className="uk-width-1-4@s">
              <div className="uk-inline uk-width-1-1">
                <span className="uk-form-icon qzf qzf-monitor" />
                <input id="url" className="uk-input" type="text" defaultValue="" placeholder="网址" name="url" />
              </div>
            </div>
            <div className="uk-width-1-4@s">
              <button name="submit" className="qzhai-comment-submit uk-button uk-width-1-1" type="submit" id="submit">
                评论
              </button>
            </div>
            <input type="hidden" id="qzhai-comment-nonce" name="qzhai-comment-nonce" defaultValue="9b9a887d1f" />{' '}
            <input type="hidden" name="comment_post_ID" defaultValue={1892} id="comment_post_ID" />
            <input type="hidden" name="comment_parent" id="comment_parent" defaultValue={0} />
          </form>
        </div>
      </div>
    </>
  );
};
