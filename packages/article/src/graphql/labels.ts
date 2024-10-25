import { client, gql } from '../utils/client';
import { owner, repo } from '../config';

// GraphQL 查询
const query = gql`
  query ($owner: String!, $repo: String!, $first: Int!, $after: String) {
    repository(owner: $owner, name: $repo) {
      labels(first: $first, after: $after) {
        nodes {
          id
          name
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

// 获取所有标签数据
export const getLabels = async () => {
  let labels: unknown[] = [];
  let hasNextPage = true;
  let after: any = null;

  while (hasNextPage) {
    const variables = {
      owner,
      repo,
      // 每次获取100条
      first: 100,
      after,
    };

    const data = await client.request<{ repository: { labels: { nodes: unknown[]; pageInfo: any } } }>(
      query,
      variables,
    );

    const labelNodes = data.repository.labels.nodes;
    labels = labels.concat(
      labelNodes.map((label: any) => ({
        id: label.id,
        name: label.name,
        description: label.description,
      })),
    );

    hasNextPage = data.repository.labels.pageInfo.hasNextPage;
    after = data.repository.labels.pageInfo.endCursor;
  }

  return labels;
};
