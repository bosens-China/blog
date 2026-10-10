import type { APIContext } from 'astro';
import { collectDemos } from '@/utils/demos/catalog';
import { getDemoRuntime } from '@/utils/demos/compiler';

export async function getStaticPaths() {
  if (!collectDemos().size) return [];
  const runtime = await getDemoRuntime();
  return [{ params: { id: runtime.id } }];
}

export async function GET(_context: APIContext) {
  return new Response((await getDemoRuntime()).code, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
