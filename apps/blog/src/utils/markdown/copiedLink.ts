import type MarkdownIt from 'markdown-it';
import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs';

function parseDestination(state: StateInline, start: number) {
  const { src, posMax, md } = state;
  if (src[start] !== '(') return;

  let pos = start + 1;
  while (pos < posMax && /[ \t\n]/.test(src[pos]!)) pos++;
  const destination = md.helpers.parseLinkDestination(src, pos, posMax);
  if (!destination.ok) return;
  const href = md.normalizeLink(destination.str);
  if (!md.validateLink(href)) return;

  pos = destination.pos;
  const end = pos;
  while (pos < posMax && /[ \t\n]/.test(src[pos]!)) pos++;
  let title = '';
  if (pos > end) {
    const parsedTitle = md.helpers.parseLinkTitle(src, pos, posMax);
    if (parsedTitle.ok) {
      title = parsedTitle.str;
      pos = parsedTitle.pos;
      while (pos < posMax && /[ \t\n]/.test(src[pos]!)) pos++;
    }
  }
  if (src[pos] !== ')' || pos >= posMax) return;
  return { href, title, end: pos + 1 };
}

/** 兼容 GPT 复制产生的 [[标题](URL)](URL)，仅合并指向同一地址的链接。 */
export function copiedLinkPlugin(md: MarkdownIt): void {
  md.inline.ruler.before('link', 'copied_link', (state, silent) => {
    const linkState = state as StateInline & { linkLevel: number };
    const start = state.pos;
    if (linkState.linkLevel > 0 || !state.src.startsWith('[[', start))
      return false;

    const labelEnd = md.helpers.parseLinkLabel(state, start + 1, true);
    if (labelEnd < 0) return false;
    const inner = parseDestination(state, labelEnd + 1);
    if (!inner || state.src[inner.end] !== ']') return false;
    const outer = parseDestination(state, inner.end + 1);
    if (!outer || inner.href !== outer.href) return false;
    if (inner.title && outer.title && inner.title !== outer.title) return false;

    if (!silent) {
      const max = state.posMax;
      const token = state.push('link_open', 'a', 1);
      token.attrSet('href', inner.href);
      const title = inner.title || outer.title;
      if (title) token.attrSet('title', title);
      state.pos = start + 2;
      state.posMax = labelEnd;
      linkState.linkLevel++;
      md.inline.tokenize(state);
      linkState.linkLevel--;
      state.push('link_close', 'a', -1);
      state.posMax = max;
    }
    state.pos = outer.end;
    return true;
  });
}
