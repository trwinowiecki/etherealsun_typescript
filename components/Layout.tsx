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

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function Layout({ title, children }: LayoutProps) {
  const { status, data: session } = useSession();

  const { state, dispatch } = useContext(Store);
  const cart = state.cart;
  const [cartItemsCount, setcartItemsCount] = useState(0);
  useEffect(() => {
    setcartItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }, [cart.cartItems]);

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
        <nav className="nav flex w-full justify-between items-center h-12 px-4 shadow-lg">
          <Link href="/">
            <a className="text-lg font-bold">Ethereal Sun</a>
          </Link>
          <div className="flex h-full justify-end items-center gap-4">
            <Link href="/cart">
              <ShoppingBagIcon
                className="p-2 h-10 w-10"
                aria-label="shopping bag"
              />
            </Link>
            <Menu as="div" className="">
              <Menu.Button className="flex h-full items-center">
                {status === 'loading'
                  ? 'Loading'
                  : session?.user
                  ? session.user.name
                  : ''}
                <UserCircleIcon
                  className="p-2 h-10 w-10"
                  aria-label="account options"
                />
              </Menu.Button>
              <Transition
                as={React.Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute flex flex-col p-2 pr-4 right-0 mt-2 mr-2 w-auto origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {status === 'loading' ? (
                    'Loading'
                  ) : session?.user ? (
                    <>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={`${active && 'bg-blue-500'}`}
                            href="/account-settings"
                          >
                            Account settings
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={`${active && 'bg-blue-500'}`}
                            href="/signout"
                          >
                            Logout
                          </a>
                        )}
                      </Menu.Item>
                    </>
                  ) : (
                    <>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={`${active && 'bg-blue-500'}`}
                            href="/signin"
                          >
                            Sign In
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={`${active && 'bg-blue-500'}`}
                            href="/signup"
                          >
                            Create Account
                          </a>
                        )}
                      </Menu.Item>
                    </>
                  )}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </nav>
        <main className="container m-auto mt-4 px-4">{children}</main>
        <footer className="footer flex justify-center items-center h-10">
          <p>Copyright &copy; 2022 EtherealSunDesigns</p>
        </footer>
      </div>
    </>
  );
}
