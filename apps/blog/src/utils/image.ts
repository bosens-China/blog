/**
 * 多吉云图片处理工具 (Fixes: 变量名冲突 & 类型兼容性)
 */

export type ImageProcessMode = 'crop' | 'fit';

interface ProcessOptions {
  width?: number;
  // 修复类型报错：显式允许 undefined
  height?: number | undefined;
  mode?: ImageProcessMode;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  blur?: boolean;
}

/**
 * 获取多吉云处理后的图片 URL
 */
export function getProcessImageUrl(url: string, options: ProcessOptions = {}) {
  const rawDomains = import.meta.env.PUBLIC_DOGECLOUD_DOMAIN;
  if (!url || !rawDomains || /\.(svg|ico|gif)$/i.test(url)) return url;

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
      .filter(Boolean);

    const targetUrl = new URL(url);
    if (!supportedHostnames.includes(targetUrl.hostname)) return url;

    const {
      width,
      height,
      mode = 'fit',
      quality = 80,
      format = 'webp',
      blur,
    } = options;

    const params: string[] = ['imageMogr2'];

    // --- 1. 缩放与裁剪逻辑 ---
    if (width || height) {
      if (mode === 'crop' && width && height) {
        params.push(`thumbnail/!${width}x${height}r`);
        params.push('gravity/center');
        params.push(`crop/${width}x${height}`);
      } else {
        let size = '';
        if (width) size += width;
        size += 'x';
        if (height) size += height;

        if (size !== 'x') {
          params.push(`thumbnail/${size}`);
        }
      }
    }

    // --- 2. 格式与质量 ---
    if (format) params.push(`format/${format}`);
    params.push(`quality/${quality}`);

    // --- 3. 必选优化 ---
    params.push('strip');
    params.push('ignore-error/1');

    // --- 4. 特效 ---
    if (blur) params.push('blur/10x10');

    const paramString = params.join('/');
    // 兼容已有参数：如果有参数用 | 分隔，没有用 ? 开始
    return `${url}${url.includes('?') ? '|' : '?'}${paramString}`;
  } catch (e) {
    console.error('Image process error:', e);
    return url;
  }
}

/**
 * 生成响应式图片属性集合
 */
export function generateResponsiveImageAttrs(
  url: string,
  layoutWidth: number = 896,
  mode: ImageProcessMode = 'fit',
  aspectRatio?: number,
) {
  if (/\.(svg|ico|gif)$/i.test(url))
    return { src: url, srcset: null, sizes: null, webpSrcset: null };

  // 辅助函数
  const getHeight = (w: number) =>
    aspectRatio ? Math.round(w / aspectRatio) : undefined;

  const fallbackWidth = layoutWidth > 800 ? 1200 : 800;

  // 1. 生成兜底 src (JPG)
  const src = getProcessImageUrl(url, {
    width: fallbackWidth,
    height: getHeight(fallbackWidth),
    mode,
    format: 'jpg',
    quality: 80,
  });

  const steps = [400, 800, 1200, 1600];

  // 2. 生成 WebP srcset
  const webpSrcset = steps
    .map((w) => {
      // 修复变量名冲突：将内部变量命名为 pUrl (processedUrl)
      const pUrl = getProcessImageUrl(url, {
        width: w,
        height: getHeight(w),
        mode,
        format: 'webp',
        quality: 80,
      });
      return `${pUrl} ${w}w`;
    })
    .join(', ');

  // 3. 生成 JPG srcset
  const srcset = steps
    .map((w) => {
      // 修复变量名冲突
      const pUrl = getProcessImageUrl(url, {
        width: w,
        height: getHeight(w),
        mode,
        format: 'jpg',
        quality: 80,
      });
      return `${pUrl} ${w}w`;
    })
    .join(', ');

  const sizes = `(max-width: ${layoutWidth}px) 100vw, ${layoutWidth}px`;

  return { src, srcset, webpSrcset, sizes };
}
