import axios from "axios";
// import { hc } from "hono/client";
// import type { AppType } from "../app";
// import { HTTP_PORT } from "../constant";

export const instance = axios.create({
  baseURL: "https://api.github.com/",
  timeout: 10000,
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: process.env.AUTHORIZATION
      ? `Bearer ${process.env.AUTHORIZATION}`
      : undefined,
    "X-GitHub-Api-Version": "2022-11-28",
  },
});

// curl -L \
//   -H "Accept: application/vnd.github+json" \
//   -H "Authorization: Bearer <YOUR-TOKEN>" \
//   -H "X-GitHub-Api-Version: 2022-11-28" \
//   https://api.github.com/issues

// export const client = hc<AppType>(`http://localhost:${HTTP_PORT}`);
