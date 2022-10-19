import Layout from '../components/Layout';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// pages/404.tsx
export default function Custom404() {
  return (
    <Layout title="404">
      <div className="w-full flex flex-col items-center gap-4">
        <div className="w-9/12 sm:w-1/2 lg:w-1/3 xl:w-1/4">
          <ExclamationCircleIcon className="text-primary" />
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-5xl sm:text-8xl font-semibold">404</h1>
          <h2 className="text-lg sm:text-xl">Page Not Found</h2>
        </div>
        <div className="text-3xl sm:text-5xl text-center">
          Return{' '}
          <Link href="/">
            <a>home</a>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
