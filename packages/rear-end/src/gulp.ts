import pullResources from "./tasks/pullResources";
import picture from "./tasks/picture";
import gulp from "gulp";
import { error } from "./utils/other";

const build = gulp.series(pullResources, picture);

console.time("build");
build((err) => {
  err && error(err);
  console.timeEnd("build");
});
