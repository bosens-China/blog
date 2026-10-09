import { bundledThemes, createHighlighter, type Highlighter } from 'shiki';

let highlighterInstance: Highlighter | null = null;

export async function getHighlighter() {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  highlighterInstance = await createHighlighter({
    themes: [
      'github-light',
      {
        ...(await bundledThemes['github-dark']()).default,
        // 注释复用主题次要文字色，保证深色代码区的文字对比度。
        colorReplacements: { '#6a737d': 'var(--c-text-light)' },
      },
    ],
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
