import { createRoot } from 'react-dom/client';
import { Image } from 'antd';
import { errorPlaceholder } from '@/components/article-card/placeholder';
import { AntdConfig } from '@/app/other/antd-config';

export const mediumZoom = () => {
  // 用 Map 记录已经创建的 React 根节点
  const rootMap = new Map<Element, any>();

  return {
    viewerEffect({ markdownBody }: { markdownBody: Element }) {
      const imgs = [...markdownBody.querySelectorAll('img')];

      imgs.forEach((img) => {
        // 检查该 img 元素是否已经有对应的 root
        let root = rootMap.get(img);

        if (root) {
          return;
        }
        const wrapper = document.createElement('div');
        wrapper.style.textAlign = 'center';

        // 将 wrapper 替换 img 元素
        img.parentNode?.replaceChild(wrapper, img);

        // Step 2: 使用 createRoot 渲染 Ant Design 的 Image 组件
        root = createRoot(wrapper);
        rootMap.set(wrapper, root); // 将新的容器与 root 关联起来
        root.render(
          <AntdConfig>
            <Image src={img.src} preview alt={img.alt} fallback={errorPlaceholder} />
          </AntdConfig>,
        );
      });
    },
  };
};
