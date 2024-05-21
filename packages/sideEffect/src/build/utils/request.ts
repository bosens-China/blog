import axios from "axios";

export const instance = axios.create({
  baseURL: "https://api.github.com/",
  timeout: 10000,
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.AUTHORIZATION}`,
    "X-GitHub-Api-Version": "2022-11-28",
  },
});

// curl -L \
//   -H "Accept: application/vnd.github+json" \
//   -H "Authorization: Bearer <YOUR-TOKEN>" \
//   -H "X-GitHub-Api-Version: 2022-11-28" \
//   https://api.github.com/issues
