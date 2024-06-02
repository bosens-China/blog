import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import issues from "./routes/issues";
import labels from "./routes/labels";
import user from "./routes/user";
import upload from "./routes/upload";
import convert from "./routes/convert";
import { HTTP_PORT } from "./constant";
import axios from "axios";

const app = new Hono().basePath("/api");

app.use(logger());
app.use(cors());

const routes = app
  .route("/issues", issues)
  .route("/labels", labels)
  .route("/user", user)
  .route("/upload", upload)
  .route("/convert", convert);

serve({
  fetch: app.fetch,
  port: HTTP_PORT,
});

console.log(`服务运行在 http://localhost:${HTTP_PORT}`);

app.onError((err, c) => {
  if (err instanceof axios.AxiosError) {
    console.error({
      url: err.config?.url,
      //     req: err.config
    });
  } else {
    console.log(err);
  }
  // debugger;
  return c.text(`${err}`, 500);
});
export type AppType = typeof routes;
