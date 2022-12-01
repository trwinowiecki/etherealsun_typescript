import Cookies from 'js-cookie';
import { signOut } from 'next-auth/react';
import Head from 'next/head';
import React, { useContext, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartCommands } from '../enums/CartCommands';
import { DEFAULT_THEME } from '../styles/themes';
import { applyTheme } from '../styles/themes/utils';
import { Store } from '../utils/Store';
import Footer from './Footer';
import Navbar from './Navbar';
import CartPopup from './ui/cart/CartPopup';

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
  loading?: boolean;
};

export default function Layout({ title, children }: LayoutProps) {
  const { state, dispatch } = useContext(Store);
  const cart = state.cart;
  const [cartItemsCount, setcartItemsCount] = useState(0);
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    setcartItemsCount(
      cart.cartItems.reduce((acc, item) => acc + item.quantity, 0)
    );
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

      <div className="flex flex-col justify-between min-h-screen wrapper snap-y snap-mandatory">
        <Navbar />
        <div className="flex justify-center flex-1 w-full">
          <main className="mt-4 px-4 w-full lg:w-[1200px]">{children}</main>
        </div>
        <Footer />
        <CartPopup />
      </div>
    </>
  );
}
