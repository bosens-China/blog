import { Preset } from 'unocss';

type Key = 'light' | 'dark' | (string & {});

type Options = Partial<Record<Key, Record<string, string>>>;

export function themePreset(options: Options = {}): Preset {
  const colors: Record<string, string> = {};
  Object.entries(options).forEach(([, value]) => {
    if (!value) return;
    Object.keys(value).forEach((k) => {
      colors[k] = `var(--${k})`;
    });
  });

  return {
    name: themePreset.name,
    theme: {
      colors,
    },
    preflights: [
      {
        getCSS() {
          const list: string[] = [];

          Object.entries(options).forEach(([key, value]) => {
            if (!value) return;

            // 将对象转换为CSS变量的字符串
            const variables = Object.entries(value)
              .map(([varKey, varValue]) => `--${varKey}: ${varValue};`)
              .join('\n');

            // 区分 light 和 dark 模式的挂载点
            const selector = key === 'light' ? ':root' : `html[data-theme='${key}'] `;

            // 构建CSS块
            const cssBlock = `${selector} {
              ${variables}
            }`;

            list.push(cssBlock);
          });

          return list.join('\n');
        },
      },
    ],
  };
}
