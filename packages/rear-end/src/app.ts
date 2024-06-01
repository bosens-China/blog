import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import issues from "./routes/issues";
import labels from "./routes/labels";
import user from "./routes/user";
import upload from "./routes/upload";
import { HTTP_PORT } from "./constant";

const app = new Hono().basePath("/api");

app.use(logger());
app.use(cors());

const routes = app
  .route("/issues", issues)
  .route("/labels", labels)
  .route("/user", user)
  .route("/upload", upload);

serve({
  fetch: app.fetch,
  port: HTTP_PORT,
});

console.log(`服务运行在 http://localhost:${HTTP_PORT}`);

export type AppType = typeof routes;
