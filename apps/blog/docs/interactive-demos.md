# 文章内的交互演示

在 GitHub Issue 的 Markdown 中给 TSX 代码块加上 `demo`，博客就会默认展示运行结果。点击右上角的代码图标查看、复制源码，再点击播放图标重新进入演示。

````markdown
```tsx demo title="计数器" height=240
import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>点击次数：{count}</button>;
}
```
````

- `tsx demo` 开启演示；普通 `tsx` 代码块保持原来的展示方式。
- `title="标题"` 可选，默认「交互演示」，标题用双引号包裹。
- `height=240` 可选，默认 420，范围 160–1200，单位为像素。
- 默认导出的 React 组件就是入口，不需要自己调用 `createRoot`。
- 可以写状态、事件、Canvas、SVG 和动画。样式放在组件的 `style` 属性或 `<style>` 元素中；演示不继承博客的 UnoCSS 类。
- 可以使用 `var(--c-bg)`、`var(--c-text)`、`var(--c-text-light)`、`var(--c-border)`、`var(--c-fill-subtle)`、`var(--c-fill-hover)` 等主题变量，深浅主题会同步。

首版仅支持单文件 React TSX，可以导入 `react`。不支持其他 npm 依赖、项目路径、动态导入或 `import.meta`。演示在限制网络和页面权限的沙箱中运行，不能访问博客 Cookie、本地存储或后端接口。不要在演示中放密钥或其他私密数据，源码会公开展示。

## 加载与构建

代码在博客构建时编译，浏览器不下载 TSX 编译器。React 运行时只生成一份带内容哈希的静态 JS，多个演示共用浏览器缓存；每个演示页面只包含自己的编译代码。

构建会限制 gzip 体积：共享运行时不超过 80 KiB，单个演示的编译 JS 不超过 32 KiB，超过即停止发布。这不包含文章中的高亮源码或演示自身的数据图片。服务器需开启 gzip 或 Brotli 才能按压缩后的体积传输。

演示进入可视区域附近才加载。切到「代码」或滚动离开后会卸载，返回「演示」或重新进入该区域会从初始状态运行，因此不要依赖演示保留进度。没有演示的文章不会请求演示运行时。

演示编译失败会阻止发布，运行时错误会显示在演示区域。构建后可检查 `dist/demos/` 的体积。`pnpm --filter blog dev` 同样支持演示，本地修改 `packages/blog-data/data` 中的文章内容后刷新查看。

参考：[Vite TSX 支持](https://vite.dev/guide/features#jsx)、[Vite 构建 API](https://vite.dev/guide/api-javascript#build)。
