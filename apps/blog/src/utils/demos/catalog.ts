import MarkdownIt from 'markdown-it';
import { allPosts, about } from '../data';
import { weeklyIssues, getWeeklyBody } from '../weekly';
import { markdownOptions } from '../markdown/options';
import { getDemoId, parseDemoInfo } from './definition';

export function collectDemos(): Map<string, string> {
  const md = MarkdownIt(markdownOptions);
  const demos = new Map<string, string>();
  const documents = [
    ...allPosts.map((post) => ({ title: post.title, body: post.body })),
    { title: '关于', body: about.content },
    ...weeklyIssues.map((issue) => ({
      title: issue.title,
      body: getWeeklyBody(issue),
    })),
  ];
  for (const document of documents) {
    try {
      for (const token of md.parse(document.body, {})) {
        if (token.type === 'fence' && parseDemoInfo(token.info)) {
          demos.set(getDemoId(token.content), token.content);
        }
      }
    } catch (error) {
      throw new Error(`文章「${document.title}」的演示配置错误`, {
        cause: error,
      });
    }
  }
  return demos;
}
