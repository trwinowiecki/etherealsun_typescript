import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import Layout from '../components/layout';

// pages/404.tsx
export default function Custom404() {
  return (
    <Layout title="404">
      <div className="flex flex-col items-center w-full gap-4">
        <div className="w-9/12 sm:w-1/2 lg:w-1/3 xl:w-1/4">
          <ExclamationCircleIcon className="text-primary" />
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-5xl font-semibold sm:text-8xl">404</h1>
          <h2 className="text-lg sm:text-xl">Page Not Found</h2>
        </div>
        <div className="text-3xl text-center sm:text-5xl">
          Return <Link href="/">home</Link>
        </div>
      </div>
    </Layout>
  );
}
