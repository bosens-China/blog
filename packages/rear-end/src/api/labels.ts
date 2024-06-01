import { instance } from "../utils/request";

export interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string;
}

export type LabelTypes = Label[];

export const getLabels = async (page = 1) => {
  const { GITHUB_REPOSITORY } = process.env;
  const { data } = await instance.get<LabelTypes>(
    `/repos/${GITHUB_REPOSITORY}/labels`,
    {
      params: {
        per_page: 100,
        page,
      },
    }
  );
  return data;
};
