// skillink 配置文件
// 文档与源码：https://github.com/bosens-China/skillink
//
// 常见使用方式：
//   1. 把一份 AGENTS.md 同步成多个工具能识别的文件（CLAUDE.md / GEMINI.md ...）
//        agentsMarkdown: [{ from: '**/AGENTS.md', to: ['CLAUDE.md', 'GEMINI.md'] }]
//   2. 把 .agents 目录链接成 .claude / .cursor 等同级目录
//        agentsSkills:   [{ from: '.agents',     to: ['.claude', '.cursor'] }]
//   3. 在 monorepo 中按 glob 匹配每个子包的 AGENTS.md，各自就地链接
//        agentsMarkdown: [{ from: 'packages/*/AGENTS.md', to: ['CLAUDE.md'] }]
//   4. 任意字面映射（既支持文件也支持目录）
//        links: [{ from: '.env.example', to: '.env.template' }]
//   5. 用 `skillink lock` 把敏感文件加密为 .lock 提交到仓库
//        encrypt: ['.mcp.json', '.env']
//
// 常用命令：
//   skillink                同步映射
//   skillink --dry-run      仅预览，不写盘
//   skillink --yes          全自动确认（CI 推荐）
//   skillink lock / unlock  加密 / 还原敏感文件

export default {
  // Agent 文档：glob 匹配（遵守 .gitignore），to 相对于每个 AGENTS.md 所在目录
  agentsMarkdown: [
    {
      from: '**/AGENTS.md',
      to: ['CLAUDE.md'],
    },
  ],
  // Skills 目录：to 与命中的源目录同级（在其父目录下）
  agentsSkills: [
    {
      from: '.agents',
      to: ['.claude'],
    },
  ],
  // lock 默认加密列表；unlock 无参且 skillink.encrypt.json 为空时回退此列表
  encrypt: ['.mcp.json'],
};
