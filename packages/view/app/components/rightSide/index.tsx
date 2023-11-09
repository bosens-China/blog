import { Classification, Recently } from "../../components/column";

export const RightSide = () => {
  return (
    <div id="qzhai-sidebar" style={{ minWidth: "220px" }}>
      <div className="qzhai-sidebar-box">
        <div uk-sticky="bottom: #qzhai-sidebar" className="uk-sticky">
          <ul className="qzhai-sidebar">
            <Classification></Classification>
            <Recently></Recently>
          </ul>
        </div>
        <div
          className="uk-sticky-placeholder"
          hidden
          style={{ height: 563, margin: 0 }}
        />
      </div>
    </div>
  );
};
