import type { APIContext } from 'astro';
import { collectDemos } from '@/utils/demos/catalog';
import { compileDemo } from '@/utils/demos/compiler';

export function getStaticPaths() {
  return [...collectDemos()].map(([id, source]) => ({
    params: { id },
    props: { source },
  }));
}

export async function GET({ props }: APIContext) {
  return new Response(await compileDemo(props.source), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
