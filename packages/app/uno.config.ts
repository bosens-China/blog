// uno.config.ts
import { defineConfig, presetUno, toEscapedSelector as e } from "unocss";
import transformerVariantGroup from "@unocss/transformer-variant-group";
// import presetChinese from "unocss-preset-chinese";

export default defineConfig({
  presets: [
    presetUno(),
    // presetChinese({
    //   // 指定文本为简体中文
    //   chineseType: "simplified",
    // }),
  ],
  rules: [
    [
      /^nth-(\d+):(.*)$/,
      async ([, d, r], { rawSelector, generator }) => {
        const rule = await generator.parseToken(r);

        return `${e(rawSelector)} > *:nth-child(${d}) { ${rule![0][2]} }`;
      },
    ],
  ],
  transformers: [transformerVariantGroup()],
  shortcuts: {
    // 左侧菜单栏的按钮
    btn: "lh-28px text-size-16px color-#222 text-center inline-block rounded-12 w-100% color-#222 bg-white p-y-11 p-x-4",
    // 左侧菜单栏激活按钮样式
    "btn-activate": "bg-#0F7AE5 color-white",
    // 1px的边框
    "1pxbor": "h-1px bg-[#000]/10 block w-100%",
    // 左侧搜索框样式
    inp: `p-y-11 text-center color-#999 lh-28px text-size-16px`,
    // 左侧链接样式
    link: `lh-16px color-#999 text-size-14px text-center block m-y-10`,
    // 底部导航栏的按钮
    "navigation-button": `rounded-8 bg-white font-500 text-size-15px color-#0F7AE5 lh-24px p-x-18 p-y-8`,
    // 底部导航按钮禁用
    "navigation-button-disable": `opacity-40 cursor-no-drop`,
  },
});
