import axios from 'axios';

export const instance = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 5000,
});
