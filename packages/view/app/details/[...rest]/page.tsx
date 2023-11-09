import { FC, useMemo } from "react";
import data, { classification } from "@blog/user-data";
import Link from "next/link";
// import { redirect } from "next/navigation";
import NotFound from "./not-found";
import { Head } from "./head";
import { Content } from "./content";
import "./styles.scss";
// import { RelatedReading } from "./relatedReading";
// import { Share } from "./share";

interface Props {
  params: { rest: [string, string] };
  searchParams: Record<string, string>;
}

const Details: FC<Props> = ({
  params: {
    rest: [id, typeId],
  },
}) => {
  const current = useMemo(() => {
    return data.issuesData.find((f) => f.id === +id);
  }, [id]);

  // 确定筛选范围
  const classifiedData = useMemo(() => {
    const arr = typeId
      ? Array.from(classification.get(typeId) || [])
      : data.issuesData;
    const index = arr.findIndex((f) => f.id === +id);
    const first = index <= 0 ? undefined : arr[index - 1];
    const last = arr[index + 1];
    return {
      first,
      last,
    };
  }, [id, typeId]);
  if (!current) {
    return <NotFound></NotFound>;
  }

  return (
    <>
      <div className="uk-first-column">
        <div className="qzhai-main-content qzhai-content qzhai-main-content-single uk-card uk-card-default">
          <div className="uk-card-body">
            <article className="qzhai-article uk-article">
              <Head current={current}></Head>
              <hr className="qzhai-content-divider uk-divider-small" />
              <div className="qzhai-the-content">
                <Content md={current.body || ""}></Content>
              </div>
            </article>
            {/* <Share></Share> */}
            <div className="qzhai-extension-post">
              <div className="uk-child-width-1-2 uk-grid" uk-grid="">
                <div className="uk-first-column">
                  {classifiedData.first && (
                    <Link
                      href={
                        "/details/" +
                        [classifiedData.first.id, typeId]
                          .filter((f) => f)
                          .join("/")
                      }
                    >
                      <span>上一篇</span>
                      <div>{classifiedData.first.title}</div>
                    </Link>
                  )}
                </div>
                <div>
                  {classifiedData.last && (
                    <Link
                      href={
                        "/details/" +
                        [classifiedData.last.id, typeId]
                          .filter((f) => f)
                          .join("/")
                      }
                    >
                      <span>下一篇</span>
                      <div>{classifiedData.last.title}</div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <RelatedReading></RelatedReading> */}
      </div>
    </>
  );
};

export default Details;
