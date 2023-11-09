import { FC } from "react";
import { Content } from "@/app/components/content";
import data from "@blog/user-data";
import { Props as PageNumberProps } from "@/app/components/content/pageNumber";
import { PAGETOTAL } from "@/app/constant";

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
      <Content {...obj} page={+page}></Content>
    </>
  );
};

export default Page;
