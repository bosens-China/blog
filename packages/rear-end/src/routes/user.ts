import { userDb } from "../database/user";
import { UserTypes, getUser } from "../api/user";
import { Hono } from "hono";
import { client } from "../utils/request";

export const readData = async () => {
  if (Object.keys(userDb.data).length) {
    return userDb.data as UserTypes;
  }
  const data = await getUser();

  // 上传头像到图床服务器
  const info = await client.api.upload
    .$get({
      query: { url: data.avatar_url },
    })
    .then((res) => {
      return res.json();
    });

  data.avatar_url = info.masterDrawing;
  userDb.data = data;
  userDb.write();
  return data;
};

const app = new Hono().get("/", async (c) => {
  const data = await readData();
  return c.json(data);
});

export default app;
