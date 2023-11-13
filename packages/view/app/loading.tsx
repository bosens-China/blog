import { Skeleton } from "antd";

interface Props {
  title?: string;
}

export default function Loading({ title }: Props) {
  return (
    <div id="qzhai-main" className="uk-first-column">
      <div className="qzhai-main-content uk-card uk-card-default">
        <div className="uk-card-header">
          <div className="qzhai-card-header-title">{title}</div>
        </div>
        <div className="uk-card-body">
          <Skeleton active />
        </div>
      </div>
    </div>
  );
}
