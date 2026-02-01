# Xiaowo's Blog (Frontend)

这是一个简约、现代化的个人博客前端项目，作为 MonoRepo 的一部分。
设计风格追求简约，支持深色/浅色模式，适配多端设备。

## 🛠 技术栈

- **Core**: [Astro](https://astro.build/)
- **Style**: [UnoCSS](https://unocss.dev/) (Tailwind compatible)
- **Script**: TypeScript, React
- **Content**: MDX, Static Site Generation (SSG)

## 🧞 开发指南

在项目根目录下运行：

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (apps/blog)
pnpm --filter blog dev

# 构建生产版本
pnpm --filter blog build

# 预览构建产物
pnpm --filter blog preview
```

## 📁 目录说明

- `src/content`: 博客文章内容 (由后端 core 生成或手动维护)
- `src/pages`: 页面路由
- `src/components`: UI 组件
- `src/layouts`: 页面布局
- `src/styles`: 全局样式与变量

## 📝 备注

首页 `/` 默认重定向至 `/page/1/` 以展示文章列表。
