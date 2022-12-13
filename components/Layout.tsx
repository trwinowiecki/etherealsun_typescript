import Head from 'next/head';
import React, { useContext, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { DEFAULT_THEME } from '../styles/themes';
import { applyTheme } from '../styles/themes/utils';
import { Store } from '../utils/Store';

import Footer from './Footer';
import Navbar from './Navbar';
import CartPopup from './ui/cart/CartPopup';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  overridePadding?: boolean;
}

export default function Layout({
  title,
  children,
  overridePadding = false
}: LayoutProps) {
  const { state, dispatch } = useContext(Store);
  const cart = state.cart;
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    setCartItemsCount(
      cart.cartItems.reduce((acc, item) => acc + item.quantity, 0)
    );
  }, [cart.cartItems]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <>
      <Head>
        <title>{title ? `${title} | EtherealSun` : 'EtherealSun'}</title>
        <meta name="description" content="Ethereal Sun Designs Jewelry" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ToastContainer position="bottom-center" limit={1} />

      <div className="flex flex-col justify-between min-h-screen wrapper snap-y snap-mandatory">
        <Navbar />
        <div className="flex justify-center flex-1 w-full">
          <main
            className={`${
              overridePadding ? '' : 'px-4 mt-4'
            } w-full xl:w-[1200px]`}
          >
            {children}
          </main>
        </div>
        <Footer />
        <CartPopup />
      </div>
    </>
  );
}
