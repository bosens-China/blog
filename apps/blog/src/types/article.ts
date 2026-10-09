/** 详情页元信息中的一项，带 href 时可点击 */
export interface MetaItem {
  text: string;
  href?: string | undefined;
}

/** 文章在所属专栏中的位置 */
export interface SeriesInfo {
  name: string;
  href: string;
  total: number;
  /** 从 1 开始 */
  position: number;
}
