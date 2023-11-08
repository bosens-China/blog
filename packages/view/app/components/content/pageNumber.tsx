export const PageNumber = () => {
  return (
    <div className="qzhai-pagination-box uk-margin-top uk-flex uk-flex-center">
      <ul className="uk-pagination qzhai-pagination uk-margin">
        <li className="uk-active">
          <a href="https://zbl.cc/">1</a>
        </li>
        <li className="">
          <a href="https://zbl.cc/page/2">2</a>
        </li>
        <li className="">
          <a href="https://zbl.cc/page/3">3</a>
        </li>
        <li className="">
          <a href="https://zbl.cc/page/4">4</a>
        </li>
        <li className="">
          <a href="https://zbl.cc/page/5">5</a>
        </li>
        <li className="uk-disabled">
          <span>...</span>
        </li>
        <li>
          <a href="https://zbl.cc/page/7">7</a>
        </li>
      </ul>
    </div>
  );
};
