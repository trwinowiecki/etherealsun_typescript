/* eslint-disable @shopify/jsx-no-complex-expressions */
import { Menu, Transition } from '@headlessui/react';
import { ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { forwardRef, useContext, useEffect } from 'react';

import { useFirebaseAuth } from '../utils/firebase/firebaseAuth';
import { Store } from '../utils/Store';

interface myLinkProps {
  children: React.ReactNode;
  href: string;
  active: boolean;
}

// eslint-disable-next-line react/display-name
const MyLink = forwardRef<HTMLAnchorElement, myLinkProps>((props, ref) => {
  const { href, active, children, ...rest } = props;

  return (
    <Link href={href}>
      <a
        ref={ref}
        {...rest}
        className={`${active && 'bg-primary-background-darker'} py-2 px-4`}
      >
        {children}
      </a>
    </Link>
  );
});

interface myButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
}

const MyButton = forwardRef<HTMLButtonElement, myButtonProps>((props, ref) => {
  const { onClick, active, children } = props;

  return (
    <button
      onClick={onClick}
      className={`${active && 'bg-primary-background-darker'} py-2 px-4`}
    >
      {children}
    </button>
  );
});

function Navbar() {
  const { state, dispatch } = useContext(Store);
  const { user, logout } = useFirebaseAuth();
  const router = useRouter();

  const {
    cart: { cartItems }
  } = state;

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {}, [user]);

  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between w-full h-12 px-4 shadow-md nav bg-primary-background">
      <Link href="/">
        <a className="text-lg font-bold">Ethereal Sun</a>
      </Link>
      <div className="flex items-center justify-end h-full gap-4 nav-items">
        <div className="">
          <Link href="/cart">
            <div className="relative w-full h-full">
              <ShoppingBagIcon
                className="w-10 h-10 p-2"
                aria-label="shopping bag"
              />
              <div
                className={`${
                  cartItems.length > 0 ? 'absolute' : 'hidden'
                } top-1 right-1`}
              >
                <div className="flex justify-center items-center text-white bg-red-500 rounded-full h-4 min-w-[1rem] text-center text-xs px-1">
                  {cartItems.reduce((acc, item) => (acc += item.quantity), 0)}
                </div>
              </div>
            </div>
          </Link>
        </div>
        <Menu as="div" className="z-10">
          <Menu.Button className="flex items-center h-full">
            {user ? user.displayName : ''}
            <UserCircleIcon
              className="w-10 h-10 p-2"
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
            <Menu.Items className="absolute right-0 flex flex-col w-auto mt-2 mr-2 origin-top-right rounded-md shadow-lg menu-items ring-1 ring-black ring-opacity-5 focus:outline-none bg-primary-background">
              {user ? (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <MyLink href="/account-settings" active={active}>
                        Account settings
                      </MyLink>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <MyButton onClick={handleSignOut} active={active}>
                        Logout
                      </MyButton>
                    )}
                  </Menu.Item>
                </>
              ) : (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <MyLink href="/login" active={active}>
                        Sign In
                      </MyLink>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <MyLink href="/signup" active={active}>
                        Create Account
                      </MyLink>
                    )}
                  </Menu.Item>
                </>
              )}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </nav>
  );
}

export default dynamic(() => Promise.resolve(Navbar), { ssr: false });
