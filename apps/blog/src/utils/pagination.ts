/**
 * 参考 lu2 逻辑实现的响应式分页序列生成器
 */

export type PaginationItem = number | '...';

/**
 * 生成分页序列
 * @param current 当前页码
 * @param total 总页数
 * @param delta 左右保留的页码数量 (默认 2，即当前页左右各显示 2 个)
 */
export function generatePaginationSequence(
  current: number,
  total: number,
  delta: number = 2,
): PaginationItem[] {
  // 如果总页数小于等于 7，直接显示全部，不使用省略号
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const sequence: PaginationItem[] = [];

  // 计算左右范围
  const left = current - delta;
  const right = current + delta;

  // 始终包含第一页
  sequence.push(1);

  if (left > 2) {
    // 如果左边距离第一页较远，添加省略号
    sequence.push('...');
  }

  // 计算中间的数字部分
  // 确保范围在 [2, total-1] 之间
  const rangeLeft = Math.max(2, left);
  const rangeRight = Math.min(total - 1, right);

  // 这里的逻辑参考 lu2: 如果靠近边缘，则向另一侧补偿
  // 保证中间显示的数字个数相对固定
  let start = rangeLeft;
  let end = rangeRight;

  if (current <= 4) {
    end = Math.min(5, total - 1);
  } else if (current > total - 4) {
    start = Math.max(total - 4, 2);
  }

  for (let i = start; i <= end; i++) {
    sequence.push(i);
  }

  if (end < total - 1) {
    // 如果右边距离最后一页较远，添加省略号
    sequence.push('...');
  }

  // 始终包含最后一页
  sequence.push(total);

  return sequence;
}
