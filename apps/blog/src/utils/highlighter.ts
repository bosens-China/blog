import { createHighlighter, type Highlighter } from 'shiki';

let highlighterInstance: Highlighter | null = null;

export async function getHighlighter() {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  highlighterInstance = await createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: [
      'javascript',
      'typescript',
      'python',
      'py',
      'json',
      'html',
      'css',
      'bash',
      'shell',
      'markdown',
      'vue',
      'astro',
      'yaml',
      'toml',
      'sql',
      'rust',
      'go',
      'jsx',
      'tsx',
      'docker',
      'dockerfile',
      'xml',
      'nginx',
      'scss',
      'sass',
      'less',
      'stylus',
      'graphql',
      'handlebars',
      'diff',
      'makefile',
      'ini',
      'bat',
      'cmd',
      'powershell',
      'php',
      'java',
      'c',
      'cpp',
      'csharp',
    ],
  });

  return highlighterInstance;
}
