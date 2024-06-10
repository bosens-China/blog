/*
 * 压缩现有文件
 */

import gulp from "gulp";

import imagemin, { gifsicle, mozjpeg, optipng, svgo } from "gulp-imagemin";
import imageminWebp from "imagemin-webp";

export default function compress() {
  return gulp
    .src("src/temporarily/imgage/*")
    .pipe(imagemin([gifsicle(), mozjpeg(), optipng(), svgo(), imageminWebp()]))
    .pipe(gulp.dest("src/temporarily/compress/imgage"));
}
