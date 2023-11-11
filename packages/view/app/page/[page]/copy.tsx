"use client";

import { FC } from "react";
import { Content } from "@/app/components/content";
import { Props as PageNumberProps } from "@/app/components/content/pageNumber";

type Props = {
  page: number;
} & PageNumberProps;

export const PageClient: FC<Props> = ({ page, pageData }) => {
  return (
    <>
      <Content pageData={pageData} page={+page}></Content>
    </>
  );
};
