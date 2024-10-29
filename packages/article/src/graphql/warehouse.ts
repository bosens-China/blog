import { owner } from '../config';
import { client, gql } from '../utils/client';

const query = gql`
  query ($username: String!, $cursor: String) {
    user(login: $username) {
      repositories(first: 100, after: $cursor, isFork: false, privacy: PUBLIC) {
        nodes {
          name
          stargazerCount
          url
          description
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const getRepositories = async () => {
  let repositories: unknown[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const variables: any = {
      username: owner, // 将 owner 作为用户名传递
      cursor,
    };

    const data = await client.request<{
      user: { repositories: { nodes: any; pageInfo: any } };
    }>(query, variables);

    const repoNodes = data.user.repositories.nodes;

    repositories = repositories.concat(
      repoNodes.map((repo: any) => ({
        name: repo.name,
        stars: repo.stargazerCount,
        url: repo.url,
        description: repo.description,
      })),
    );

    hasNextPage = data.user.repositories.pageInfo.hasNextPage;
    cursor = data.user.repositories.pageInfo.endCursor;
  }

  return repositories;
};
