import { instance } from "../utils/request";

const { OWNER, REPO } = process.env;

export const issues = async (page = 1) => {
  const { data } = await instance.get(`/repos/${OWNER}/${REPO}/issues`, {
    params: {
      filter: "created",
      state: "open",
      sort: "updated",
      per_page: 100,
      page,
    },
  });
  return data;
};

export const labels = async (page = 1) => {
  const { data } = await instance.get(`/repos/${OWNER}/${REPO}/labels`, {
    params: {
      per_page: 100,
      page,
    },
  });
  return data;
};
export const user = async () => {
  const { data } = await instance.get(`/user`);
  return data;
};
