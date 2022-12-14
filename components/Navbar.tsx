/* eslint-disable jsx-a11y/anchor-is-valid */
import { Menu, Transition } from '@headlessui/react';
import { ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { FirebaseError } from 'firebase/app';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { forwardRef, useContext } from 'react';
import { toast } from 'react-toastify';

import { CartCommand } from '../enums/CartCommands';
import { useFirebaseAuth } from '../utils/firebase/firebaseAuth';
import { Store } from '../utils/Store';

interface MyLinkProps {
  children: React.ReactNode;
  href: string;
  active: boolean;
}

const MyLink = forwardRef<HTMLAnchorElement, MyLinkProps>((props, ref) => {
  const { href, active, children, ...rest } = props;

  return (
    <Link href={href}>
      <a
        ref={ref}
        {...rest}
        className={`${active ? 'bg-primary-background-darker' : ''} py-2 px-4`}
      >
        {children}
      </a>
    </Link>
  );
});

interface MyButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
}

const MyButton = forwardRef<HTMLButtonElement, MyButtonProps>(props => {
  const { onClick, active, children } = props;

  return (
    <button
      onClick={onClick}
      className={`${
        active ? 'bg-primary-background-darker' : ''
      } py-2 px-4 text-left`}
      type="button"
    >
      {children}
    </button>
  );
});

function Navbar() {
  const { state, dispatch } = useContext(Store);
  const { user, logout } = useFirebaseAuth();

  const {
    cart: { cartItems }
  } = state;

  const handleSignOut = async () => {
    try {
      await logout!();
      dispatch({
        type: CartCommand.CLEAR
      });
    } catch (error) {
      toast.error((error as FirebaseError).message);
    }
  };

  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between w-full h-12 px-4 shadow-md nav bg-primary-background">
      <Link href="/">
        <a className="text-lg font-bold">Ethereal Sun</a>
      </Link>
      <div className="flex items-center justify-end h-full gap-4 nav-items">
        <Link href="/cart">
          <button className="relative" type="button">
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
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </div>
            </div>
          </button>
        </Link>
        <Menu as="div" className="z-50">
          <Menu.Button className="flex items-center h-full">
            <>
              {user?.displayName && (
                <span className="pl-2">{user.displayName}</span>
              )}
              <UserCircleIcon
                className="w-10 h-10 p-2"
                aria-label="account options"
              />
            </>
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
            <Menu.Items className="absolute z-30 flex flex-col justify-start w-auto mt-4 origin-top-right rounded-md shadow-lg right-4 menu-items ring-1 ring-black ring-opacity-5 focus:outline-none bg-primary-background">
              {user ? (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <MyLink href="/account" active={active}>
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
