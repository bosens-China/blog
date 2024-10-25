import { GraphQLClient, gql } from 'graphql-request';

const AUTHORIZATION = process.env.GITHUB_TOKEN || process.env.AUTHORIZATION;

if (!AUTHORIZATION) {
  throw new Error(`环境变量不存在，请检查.env文件是否存在或者CI是否正确传递变量！`);
}

export const client = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    // 请替换为你的 GitHub 访问令牌
    Authorization: `Bearer ${AUTHORIZATION}`,
  },
});

export { gql };
