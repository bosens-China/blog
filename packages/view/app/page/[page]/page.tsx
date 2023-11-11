import { FC, Suspense } from "react";
import { Content } from "@/app/components/content";
import data from "@blog/user-data";
import { Props as PageNumberProps } from "@/app/components/content/pageNumber";
import { PAGETOTAL } from "@/app/constant";
import { PageClient } from "./copy";

interface Props {
  params: { page: string };
  searchParams: Record<string, string>;
}

const Page: FC<Props> = ({ params: { page } }) => {
  const pageData = Math.ceil(data.issuesData.length / PAGETOTAL);
  const obj: PageNumberProps = {
    pageData: Array.from({ length: pageData }).map((item, index) => {
      return {
        page: index + 1,
        label: `${index + 1}`,
        url: `/page/${index + 1}`,
      };
    }),
    page: +page,
  };

  return (
    <>
      <Suspense fallback={<Content {...obj}></Content>}>
        <PageClient {...obj}></PageClient>
      </Suspense>
    </>
  );
};

export default Page;
