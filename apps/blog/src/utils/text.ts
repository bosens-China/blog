/** 将 Markdown 粗略转为纯文本摘要，用于 RSS 等无 SEO 描述的场景 */
export function toPlainDescription(content: string, maxLength = 200): string {
  const plain = content
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[#*`~_>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const chars = Array.from(plain);
  return chars.length > maxLength
    ? `${chars.slice(0, maxLength).join('')}...`
    : plain;
}
