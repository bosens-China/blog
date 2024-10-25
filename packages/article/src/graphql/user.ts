import { client, gql } from '../utils/client';
import { owner } from '../config';

export const getUser = async () => {
  const query = gql`
    query ($username: String!) {
      user(login: $username) {
        avatarUrl
        url
        name
        bio
      }
    }
  `;

  try {
    const data = await client.request<{ user: Record<string, any> }>(query, { username: owner });
    return data.user;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch user data from GitHub');
  }
};
