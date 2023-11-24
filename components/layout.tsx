import CartPopup from '@ui/cart/popup';
import Head from 'next/head';
import { PropsWithChildren, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { DEFAULT_THEME } from '../styles/themes';
import { useTheme } from '../hooks/theme';

import { cn } from '../utils/tw-utils';
import Footer from './footer';
import Navbar from './navbar';

interface LayoutProps {
  title?: string;
  overridePadding?: boolean;
}

export default function Layout({
  title,
  children,
  overridePadding = false
}: PropsWithChildren<LayoutProps>) {
  const [theme, setTheme] = useTheme();
  // todo implement theme selector

  return (
    <>
      <Head>
        <title>{title ? `${title} | EtherealSun` : 'EtherealSun'}</title>
        <meta name="description" content="Ethereal Sun Designs Jewelry" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ToastContainer position="bottom-center" limit={1} />

      <main className="flex flex-col justify-between min-h-screen overflow-x-hidden wrapper snap-y snap-mandatory">
        <Navbar />
        <section
          className={cn(
            'flex justify-center flex-1 w-full mx-auto xl:w-[1200px] px-4 mt-4 [&>*]:w-full',
            { 'p-0 my-0': overridePadding }
          )}
        >
          {children}
        </section>
        <Footer />
        <CartPopup />
      </main>
    </>
  );
}
