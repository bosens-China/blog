/**
 * 多吉云图片处理工具
 * 文档：https://docs.dogecloud.com/mps/dev-rule-imageview2
 */

export type ImageProcessMode = "crop" | "fit";

/**
 * 获取多吉云处理后的图片 URL
 * @param url 原始图片 URL
 * @param options 处理选项
 */
export function getProcessImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    mode?: ImageProcessMode;
    quality?: number;
  }
) {
  if (!url) return url;

  // 忽略不支持处理的图片格式
  if (/\.(svg|ico)$/i.test(url)) {
    return url;
  }

  // 检查是否为支持的 CDN 域名
  // 优先读取环境变量，格式为 "domain1.com,domain2.com"
  const envDomains = import.meta.env.DOGECLOUD_DOMAIN
    ? import.meta.env.DOGECLOUD_DOMAIN.split(",").map((d: string) => d.trim())
    : [];

  const supportedDomains = [
    ...new Set(["dogecdn.com", "cdn.xiaowo.live", ...envDomains]),
  ];

  if (!supportedDomains.some((domain) => url.includes(domain))) {
    return url;
  }

  const { width, height, mode = "fit", quality = 85 } = options;

  // mode 1: 居中裁剪到指定宽高 (imageView2/1)
  // mode 2: 等比缩放，宽度不超过指定值 (imageView2/2)
  const dogeMode = mode === "crop" ? 1 : 2;

  let params = `imageView2/${dogeMode}`;

  if (width) params += `/w/${width}`;
  if (height) params += `/h/${height}`;

  // 加上质量控制
  params += `/q/${quality}`;

  // 如果原图已经带了参数，则追加
  const separator = url.includes("?") ? "/" : "?";
  return `${url}${separator}${params}`;
}

/**
 * 生成响应式图片属性集合 (src, srcset, sizes)
 * @param url 原始图片 URL
 * @param layoutWidth 布局容器的最大宽度 (px)，默认 896 (max-w-4xl)
 * @param mode 图片裁剪模式，默认 'fit'
 */
export function generateResponsiveImageAttrs(
  url: string, 
  layoutWidth: number = 896, 
  mode: ImageProcessMode = 'fit'
) {
  // 如果是不支持的格式，直接返回原始 URL，不生成 srcset
  if (/\.(svg|ico|gif)$/i.test(url)) {
    return {
      src: url,
      srcset: null,
      sizes: null
    };
  }

  // 默认 fallback 图片宽度 (通常略大于容器宽度以应对 1.x 屏)
  // 如果 layoutWidth 是 896，fallback 用 1200 比较安全
  const fallbackWidth = layoutWidth > 800 ? 1200 : 800;

  const src = getProcessImageUrl(url, { width: fallbackWidth, mode });

  // 生成 srcset 阶梯：400, 800, 1200, 1600
  // 这些断点覆盖了手机到 4K 屏的大部分需求
  const srcset = [
    `${getProcessImageUrl(url, { width: 400, mode })} 400w`,
    `${getProcessImageUrl(url, { width: 800, mode })} 800w`,
    `${getProcessImageUrl(url, { width: 1200, mode })} 1200w`,
    `${getProcessImageUrl(url, { width: 1600, mode })} 1600w`
  ].join(', ');

  // 生成 sizes
  // 逻辑：在移动端 (max-width: layoutWidth) 时占满屏幕 (100vw)，
  // 否则固定为布局宽度
  const sizes = `(max-width: ${layoutWidth}px) 100vw, ${layoutWidth}px`;

  return { src, srcset, sizes };
}
