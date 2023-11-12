import { instance } from "../utils/request";
import { Label, IssuesDaum, User2 } from "./type";

const { OWNER, REPO } = process.env;

export const issues = async (page = 1) => {
  const { data } = await instance.get<IssuesDaum[]>(
    `/repos/${OWNER}/${REPO}/issues`,
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
    `/repos/${OWNER}/${REPO}/labels`,
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
