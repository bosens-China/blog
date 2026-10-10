import ts from 'typescript';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';
import { getDemoId } from './definition';

const allowedImports = new Set(['react', 'react/jsx-runtime']);
const demoId = '\0blog-demo.tsx';
const entryId = '\0blog-demo-entry.tsx';
const reactGlobals = {
  react: 'BlogDemoReact',
  'react-dom/client': 'BlogDemoDOM',
  'react/jsx-runtime': 'BlogDemoJSX',
};
let runtime: Promise<{ id: string; code: string }> | undefined;

function validateSource(source: string) {
  const file = ts.createSourceFile(
    'demo.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function visit(node: ts.Node) {
    if (
      ts.isImportEqualsDeclaration(node) ||
      ts.isMetaProperty(node) ||
      (ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword)
    ) {
      throw new Error('演示不支持动态导入、import.meta 或 import = 语法');
    }
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const specifier = node.moduleSpecifier;
      if (
        specifier &&
        (!ts.isStringLiteral(specifier) || !allowedImports.has(specifier.text))
      ) {
        throw new Error('演示只能导入 react，不能读取项目文件或其他依赖');
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
}

async function bundle(source: string, sharedRuntime: boolean): Promise<string> {
  if (!sharedRuntime) validateSource(source);
  const result = await build({
    configFile: false,
    envDir: false,
    publicDir: false,
    logLevel: 'error',
    define: { 'process.env.NODE_ENV': '"production"' },
    oxc: { jsx: { runtime: 'automatic' } },
    plugins: [
      {
        name: 'blog-demo',
        resolveId(id, importer) {
          if (id === 'virtual:blog-demo-entry') return entryId;
          if (id === 'virtual:blog-demo') return demoId;
          if (importer === demoId && !allowedImports.has(id)) {
            throw new Error(`演示不允许导入：${id}`);
          }
          return null;
        },
        load(id) {
          if (id === demoId) return source;
          if (id === entryId && sharedRuntime) return source;
          if (id === entryId)
            return `
          import { createElement } from 'react';
          import { createRoot } from 'react-dom/client';
          import App from 'virtual:blog-demo';
          const root = document.getElementById('root');
          const showError = (error) => {
            root.textContent = '演示运行失败：' + String(error?.message ?? error);
            root.setAttribute('role', 'alert');
          };
          window.addEventListener('error', (event) => showError(event.error ?? event.message));
          window.addEventListener('unhandledrejection', (event) => showError(event.reason));
          createRoot(root).render(createElement(App));
        `;
          return null;
        },
      },
    ],
    build: {
      write: false,
      lib: {
        entry: 'virtual:blog-demo-entry',
        formats: ['iife'],
        name: 'BlogDemo',
      },
      rolldownOptions: {
        input: 'virtual:blog-demo-entry',
        external: sharedRuntime ? [] : Object.keys(reactGlobals),
        output: { globals: reactGlobals },
      },
    },
  });
  const output = Array.isArray(result) ? result[0] : result;
  if (!output || !('output' in output)) {
    throw new Error('演示构建未返回单一产物');
  }
  const chunk = output.output.find(
    (output) => output.type === 'chunk' && output.isEntry,
  );
  if (!chunk || chunk.type !== 'chunk') throw new Error('演示构建缺少入口');
  const budget = sharedRuntime ? 80 * 1024 : 32 * 1024;
  if (gzipSync(chunk.code).length > budget) {
    throw new Error(`演示产物超过 gzip 体积预算：${budget / 1024} KiB`);
  }
  return chunk.code;
}

export function getDemoRuntime() {
  runtime ??= bundle(
    `
    import * as React from 'react';
    import * as ReactDOM from 'react-dom/client';
    import * as JSX from 'react/jsx-runtime';
    Object.assign(window, { BlogDemoReact: React, BlogDemoDOM: ReactDOM, BlogDemoJSX: JSX });
  `,
    true,
  ).then((code) => ({ id: getDemoId(code), code }));
  return runtime;
}

export async function compileDemo(source: string): Promise<string> {
  const [code, shared] = await Promise.all([
    bundle(source, false),
    getDemoRuntime(),
  ]);

  // 转义脚本结束标签，源码中的字符串不能跳出当前 script 元素。
  const script = code.replace(/<\/script/gi, '<\\/script');
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; base-uri 'none'; form-action 'none'">
<title>文章交互演示</title>
<style>
:root { color-scheme: light dark; --c-bg: Canvas; --c-text: CanvasText; --c-text-light: GrayText; --c-border: GrayText; --c-fill-subtle: ButtonFace; --c-fill-hover: ButtonFace; }
* { box-sizing: border-box; }
body { margin: 0; padding: 16px; background: var(--c-bg); color: var(--c-text); font-family: var(--font-sans, system-ui, sans-serif); }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
canvas, svg, img { max-width: 100%; }
#root { overflow-wrap: anywhere; }
</style></head><body><div id="root"></div>
<script>
window.addEventListener('securitypolicyviolation', (event) => {
  document.getElementById('root').textContent = '演示资源被安全策略阻止：' + event.violatedDirective;
});
window.addEventListener('message', (event) => {
  if (event.source !== parent || event.data?.type !== 'blog-demo:theme') return;
  document.documentElement.style.colorScheme = event.data.dark ? 'dark' : 'light';
  for (const [key, value] of Object.entries(event.data.colors)) {
    if (key.startsWith('--c-') || key === '--font-sans' || key === '--font-mono') {
      document.documentElement.style.setProperty(key, value);
    }
  }
});
</script><script>
if (parent === window) {
  document.getElementById('root').textContent = '请在文章的演示区域中打开此示例';
} else {
  let started = false;
  window.addEventListener('message', (event) => {
    if (event.source !== parent || event.data?.type !== 'blog-demo:runtime' || started) return;
    if (event.data.error) {
      document.getElementById('root').textContent = '演示运行时加载失败，请重新运行';
      return;
    }
    started = true;
    try {
      const runtimeScript = document.createElement('script');
      runtimeScript.textContent = event.data.code;
      document.body.appendChild(runtimeScript);
      ${script}
    } catch (error) {
      document.getElementById('root').textContent = '演示运行失败：' + String(error.message ?? error);
    }
  });
  parent.postMessage({type: 'blog-demo:ready', runtimeUrl: '/demos/runtime/${shared.id}.js'}, '*');
}
</script></body></html>`;
}
