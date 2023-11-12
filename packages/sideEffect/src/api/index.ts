import { instance } from "../utils/request";
import { Label, IssuesDaum, User2 } from "./type";

const { GITHUB_REPOSITORY } = process.env;

export const issues = async (page = 1) => {
  const { data } = await instance.get<IssuesDaum[]>(
    `/repos/${GITHUB_REPOSITORY}/issues`,
    {
      params: {
        filter: "created",
        state: "open",
        sort: "updated",
        per_page: 100,
        page,
      },
    }
  );
  return data;
};

export const labels = async (page = 1) => {
  const { data } = await instance.get<Label[]>(
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
export const user = async () => {
  const { data } = await instance.get<User2>(`/user`);
  return data;
};
