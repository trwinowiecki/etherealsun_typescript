import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import Layout from '../components/layout';

// pages/500.tsx
export default function Custom500() {
  return (
    <Layout title="500">
      <div className="flex flex-col items-center w-full gap-4">
        <div className="w-9/12 sm:w-1/2 lg:w-1/3 xl:w-1/4">
          <ExclamationTriangleIcon className="text-primary" />
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-5xl font-semibold sm:text-8xl">500</h1>
          <h2 className="text-lg sm:text-xl">Server-side error occurred</h2>
        </div>
        <div className="text-3xl text-center sm:text-5xl">
          Return <Link href="/">home</Link>
        </div>
      </div>
    </Layout>
  );
}
