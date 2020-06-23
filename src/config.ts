// 存放配置文件
import path from "path";

export const README_PATH = path.join(process.cwd(), "README.md");
export const TEMPLATE_PATH = path.join(process.cwd(), "src/template/default.md");
// 替换标识
export const TEMPLATE_REPLACE = "<!-- ## content -->";
export const USER = "bosens-China";
// 储存的最大条数
export const maxStrip = 10;
// 存储type文件夹的位置
export const typePath = "/src/type/";
export const defaultIem = "其他";
export const special = "待完成系列";
// 重试次数
export const retry = 10;
