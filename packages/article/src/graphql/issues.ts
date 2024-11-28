import { owner, repo } from '../config';
import { client, gql } from '../utils/client';

const query = gql`
  query ($owner: String!, $repo: String!, $first: Int!, $after: String) {
    repository(owner: $owner, name: $repo) {
      issues(first: $first, after: $after, states: OPEN, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          id
          title
          url
          createdAt
          updatedAt
          body
          bodyText
          bodyHTML
          labels(first: 10) {
            nodes {
              id
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const getIssues = async () => {
  let issues: unknown[] = [];
  let hasNextPage = true;
  let after: unknown = null;

  while (hasNextPage) {
    const variables = {
      owner,
      repo,
      first: 100,
      after,
    };

    const data = await client.request<{ repository: { issues: { nodes: any; pageInfo: any } } }>(query, variables);
    const issueNodes = data.repository.issues.nodes;

    issues = issues.concat(
      issueNodes.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        html_url: issue.url,
        created_at: issue.createdAt,
        updated_at: issue.updatedAt,
        body: issue.body,
        body_text: issue.bodyText,
        body_html: issue.bodyHTML,
        labels: issue.labels.nodes.map((label: any) => ({
          id: label.id,
        })),
      })),
    );

    hasNextPage = data.repository.issues.pageInfo.hasNextPage;
    after = data.repository.issues.pageInfo.endCursor;
  }

  return issues;
};
