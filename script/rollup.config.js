/* eslint-disable @typescript-eslint/indent */
import ignorePlugin from './ignore-plugin';
import fs from 'fs-extra';
import { defineConfig } from 'rollup';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import json from '@rollup/plugin-json';
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { dependencies } from '../package.json';
import { cwd } from 'process';
import copyPlugin from 'rollup-plugin-copy';
import { string } from 'rollup-plugin-string';
import config from './config';
import typescript2 from 'rollup-plugin-typescript2';
import cliConfig from './.cli.config';

import { DEFAULT_EXTENSIONS } from '@babel/core';

const extensions = [...DEFAULT_EXTENSIONS, '.ts'];

const dist = path.join(cwd(), 'dist');
fs.removeSync(dist);

export default defineConfig(
  config.map((item) => {
    const { name } = path.parse(item.src);
    // 被忽略文件
    const ignore = item.ignore || [];
    // copy文件
    const copy = item.copy || [];

    return defineConfig({
      input: item.src,
      // 禁止打包外部依赖，ignore是必须的
      external: [...ignore, ...Object.keys(dependencies), '@babel/runtime'],
      plugins: [
        ...(item.plugins || []),
        ignorePlugin({ files: ignore }),
        nodeResolve({ extensions, rootDir: __dirname }),
        commonjs(),
        json(),
        ...(cliConfig.BUILD_TS
          ? [
              typescript2({
                tsconfigOverride: {
                  // 覆盖tsconfig.json的配置信息
                  compilerOptions: {
                    module: 'ESNext',
                  },
                },
              }),
            ]
          : [
              babel({
                babelHelpers: 'runtime',
                exclude: /exclude/,
                extensions,
                presets: [['@babel/preset-env'], '@babel/preset-typescript'],
                // 禁止打包重复模块
                plugins: ['@babel/plugin-transform-runtime'],
              }),
            ]),

        terser(),
        copyPlugin({
          targets: copy.map((item) => {
            return { src: item, dest: dist };
          }),
        }),
        preserveShebangs(),
        // 导入非js资源
        string({
          include: '**/*.{md,html}',
          exclude: [],
        }),
      ],
      output: {
        file: path.join(dist, item.format === 'cjs' ? `${name}.js` : `${name}.${item.format}.js`),
        format: item.format,
        sourcemap: true,
        exports: 'auto',
      },
    });
  }),
);
