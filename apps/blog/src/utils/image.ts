/**
 * 多吉云图片处理工具
 * 文档：https://docs.dogecloud.com/mps/dev-rule-imageview2
 */

export type ImageProcessMode = 'crop' | 'fit';

/**
 * 获取多吉云处理后的图片 URL
 */
export function getProcessImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    mode?: ImageProcessMode;
    quality?: number;
  },
) {
  const rawDomains = import.meta.env.PUBLIC_DOGECLOUD_DOMAIN;
  if (!url || !rawDomains || /\.(svg|ico)$/i.test(url)) return url;

  try {
    const supportedHostnames = rawDomains
      .split(',')
      .map((d: string) => {
        try {
          return new URL(d.trim()).hostname;
        } catch {
          return null;
        }
      })
      .filter(Boolean); // 过滤无效 URL

    if (supportedHostnames.length === 0) return url;

    const targetUrl = new URL(url);
    if (!supportedHostnames.includes(targetUrl.hostname)) return url;

    const { width, height, mode = 'fit', quality = 85 } = options;
    const dogeMode = mode === 'crop' ? 1 : 2;
    let params = `imageView2/${dogeMode}/q/${quality}`;

    if (width) params += `/w/${width}`;
    if (height) params += `/h/${height}`;

    return `${url}${url.includes('?') ? '/' : '?'}${params}`;
  } catch {
    return url;
  }
}

/**
 * 生成响应式图片属性集合 (src, srcset, sizes)
 */
export function generateResponsiveImageAttrs(
  url: string,
  layoutWidth: number = 896,
  mode: ImageProcessMode = 'fit',
) {
  if (/\.(svg|ico|gif)$/i.test(url))
    return { src: url, srcset: null, sizes: null };

  const fallbackWidth = layoutWidth > 800 ? 1200 : 800;
  const src = getProcessImageUrl(url, { width: fallbackWidth, mode });

  const srcset = [400, 800, 1200, 1600]
    .map((w) => `${getProcessImageUrl(url, { width: w, mode })} ${w}w`)
    .join(', ');

  const sizes = `(max-width: ${layoutWidth}px) 100vw, ${layoutWidth}px`;

  return { src, srcset, sizes };
}
