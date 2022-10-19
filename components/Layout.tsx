import { Menu, Transition } from '@headlessui/react';
import Head from 'next/head';
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { UserCircleIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { signOut, useSession } from 'next-auth/react';
import { Store } from '../utils/Store';
import Cookies from 'js-cookie';
import { CartCommands } from '../enums/CartCommands';
import Navbar from './Navbar';
import Footer from './Footer';
import { DEFAULT_THEME } from '../styles/themes';
import { applyTheme } from '../styles/themes/utils';

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function Layout({ title, children }: LayoutProps) {
  const { status, data: session } = useSession();
  const { state, dispatch } = useContext(Store);
  const cart = state.cart;
  const [cartItemsCount, setcartItemsCount] = useState(0);
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    setcartItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }, [cart.cartItems]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const logoutClickHandler = () => {
    Cookies.remove('cart');
    dispatch({ type: CartCommands.RESET });
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      <Head>
        <title>{title ? title + ' | EtherealSun' : 'EtherealSun'}</title>
        <meta name="description" content="Ethereal Sun Designs Jewelry" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ToastContainer position="bottom-center" limit={1} />

      <div className="wrapper flex min-h-screen flex-col justify-between">
        <Navbar />
        <main className="container m-auto mt-4 px-4">{children}</main>
        <Footer />
      </div>
    </>
  );
}
