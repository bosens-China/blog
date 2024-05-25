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
    btn: "lh-28px text-size-16px color-#222 text-center inline-block rounded-12px w-100% color-#222 bg-white p-y-11px p-x-4",
    "btn-activate": "bg-#0F7AE5 color-white",
    "1pxbor": "h-1px bg-[#000]/10 block w-100%",
    inp: `p-y-11px text-center color-#999 lh-28px text-size-16px`,
    link: `lh-16px color-#999 text-size-14px text-center block m-y-10px`,
  },
});
