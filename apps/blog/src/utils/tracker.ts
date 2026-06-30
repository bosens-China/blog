import { create } from '@boses/litetrack-sdk';
import { LITE_TRACK_BASE_URL, LITE_TRACK_TOKEN } from '@/consts';

// 单例追踪器：模块只在首次加载时执行一次，实例随 Vite 打包的脚本常驻，
// 跨 Astro view transitions 导航持续复用。
const tracker = create({
  siteToken: LITE_TRACK_TOKEN,
  baseUrl: LITE_TRACK_BASE_URL,
});

// 更新页面上所有的阅读量计数器
function updateViewCounts() {
  const counters = document.querySelectorAll<HTMLElement>('.view-counter');
  if (counters.length === 0) return;

  counters.forEach((container) => {
    const path = container.dataset.path;
    const countSpan = container.querySelector<HTMLElement>('.view-count-value');
    if (!path || !countSpan) return;

    tracker.stats
      .page(path)
      .then((stats) => {
        countSpan.innerText = stats.count.toLocaleString('zh-CN');
      })
      .catch(() => {
        // 读取失败时静默保留占位值
      });
  });
}

// 阅读深度：仅在跨越里程碑时各上报一次，单页最多 4 次请求
const READ_MILESTONES = [25, 50, 75, 100];
let reportedMilestones = new Set<number>();

function handleScroll() {
  const el = document.documentElement;
  const scrollable = el.scrollHeight - el.clientHeight;
  if (scrollable <= 0) return;

  const percent = Math.min(Math.round((el.scrollTop / scrollable) * 100), 100);

  for (const milestone of READ_MILESTONES) {
    if (percent >= milestone && !reportedMilestones.has(milestone)) {
      reportedMilestones.add(milestone);
      tracker.read(milestone);
    }
  }
}

let scrollBound = false;

function setupReadTracking() {
  // 只有带阅读量计数器的文章页才追踪阅读深度
  const isArticle = document.querySelector('.view-counter') !== null;

  // 每次导航重置里程碑
  reportedMilestones = new Set<number>();

  if (isArticle && !scrollBound) {
    window.addEventListener('scroll', handleScroll, { passive: true });
    scrollBound = true;
  } else if (!isArticle && scrollBound) {
    window.removeEventListener('scroll', handleScroll);
    scrollBound = false;
  }
}

// 首次加载与每次 view transitions 导航后执行：上报 PV -> 更新计数 -> 接入阅读深度
function onPageLoad() {
  tracker.page(); // 实时读取当前路径和标题
  updateViewCounts();
  setupReadTracking();
}

document.addEventListener('astro:page-load', onPageLoad);
