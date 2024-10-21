'use client';

import { Suspense } from 'react';
import { Search } from './search';
// import empty from '@/assets/img/empty.svg';
// import Image from 'next/image';

export default function Page() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <section>
        <Search></Search>
      </section>
    </Suspense>
  );
}
