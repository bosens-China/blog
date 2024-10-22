import { Preset } from 'unocss';
import { kebabCase } from 'lodash-es';

type ColorValue = string | { light: string; dark: string; [key: string]: string };

type NestedColorValue = {
  [key: string]: ColorValue | NestedColorObject;
};

/*
 * 支持以下格式
 * {color: '#fff'}
 * {color: {light: '#fff', dark: '#000'}}
 * {code: {color: '#fff'}}
 * {code: {color: {dark: '#fff', light: '#000'}}}
 */
interface NestedColorObject {
  [key: string]: ColorValue | NestedColorValue;
}

// 生成符合 UnoCSS 格式的 CSS 变量名称
const generateCssVariableName = (key: string) => {
  return kebabCase(key); // 使用 lodash-es 的 kebabCase 生成连字符格式的名称
};

// 解析颜色对象并生成 CSS 变量定义与样式
const parse = (obj: NestedColorObject, prefix = ''): { colors: Record<string, string>; styles: string } => {
  const colors: Record<string, string> = {};
  let rootStyles = '';
  const themeStyles: Record<string, string> = {};

  const processValue = (key: string, value: ColorValue, prefix: string) => {
    const varName = generateCssVariableName(`${prefix ? `${prefix}-` : ''}${key}`);

    if (typeof value === 'string') {
      // 如果是字符串，添加到 root 中
      colors[varName] = `var(--${varName})`;
      rootStyles += `--${varName}: ${value};\n`;
    } else if (typeof value === 'object') {
      // 处理具有 light/dark 等主题的情况
      for (const themeKey in value) {
        const themeValue = (value as Record<string, string>)[themeKey];
        colors[varName] = `var(--${varName})`;

        if (themeKey === 'light') {
          // 将 light 主题样式添加到 :root
          rootStyles += `--${varName}: ${themeValue};\n`;
        } else {
          // 将其他主题样式按主题名收集到对应的主题块中
          if (!themeStyles[themeKey]) {
            themeStyles[themeKey] = '';
          }
          themeStyles[themeKey] += `--${varName}: ${themeValue};\n`;
        }
      }
    }
  };

  const recursiveParse = (obj: NestedColorObject, prefix = '') => {
    for (const key in obj) {
      const value = obj[key];

      if (typeof value === 'object' && !('light' in value || 'dark' in value)) {
        // 递归处理嵌套对象
        recursiveParse(value as NestedColorObject, `${prefix ? `${prefix}-` : ''}${key}`);
      } else {
        processValue(key, value as ColorValue, prefix);
      }
    }
  };

  // 开始递归解析
  recursiveParse(obj, prefix);

  // 将所有主题样式组装成一个块
  let themeBlock = '';
  for (const themeKey in themeStyles) {
    themeBlock += `html[data-theme=${themeKey}] {\n${themeStyles[themeKey]}}\n`;
  }

  const styles = `:root {\n${rootStyles}}\n${themeBlock}`;
  return { colors, styles };
};

export function themePreset(variable: NestedColorObject = {}): Preset {
  const { colors, styles } = parse(variable);

  return {
    name: themePreset.name,
    theme: {
      colors,
    },
    preflights: [
      {
        getCSS() {
          return styles;
        },
      },
    ],
    // shortcuts: [
    //   [
    //     // 支持text, bg等前缀使用变量和后备值
    //     /^(bg|text)-color-var\((.*?),\s*(.*?)\)$/,
    //     ([, prefix, variable, fallback]) => {
    //       return `${prefix}-[var(--${variable}, ${fallback})]`;
    //     },
    //   ],
    // ],
  };
}
