import { Menu, Transition } from '@headlessui/react';
import { ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { forwardRef, useContext } from 'react';
import { Store } from '../utils/Store';

type myLinkProps = {
  children: React.ReactNode;
  href: string;
  active: boolean;
};

// eslint-disable-next-line react/display-name
const MyLink = forwardRef<HTMLAnchorElement, myLinkProps>((props, ref) => {
  let { href, active, children, ...rest } = props;

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

function Navbar() {
  const { status, data: session } = useSession();
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems }
  } = state;

  return (
    <nav className="nav z-50 sticky top-0 flex w-full justify-between items-center h-12 px-4 shadow-lg bg-primary-background">
      <Link href="/">
        <a className="text-lg font-bold">Ethereal Sun</a>
      </Link>
      <div className="nav-items flex h-full justify-end items-center gap-4">
        <div className="">
          <Link href="/cart">
            <div className="w-full h-full relative">
              <ShoppingBagIcon
                className="p-2 h-10 w-10"
                aria-label="shopping bag"
              />
              <div
                className={`${
                  cartItems.length > 0 ? 'absolute' : 'hidden'
                } top-1 right-1`}
              >
                <div className="flex justify-center items-center text-white bg-red-500 rounded-full h-4 min-w-[1rem] text-center text-xs px-1">
                  {cartItems.reduce(
                    (acc, item) => (acc = acc + item.quantity),
                    0
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>
        <Menu as="div" className="z-10">
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
            <Menu.Items className="menu-items absolute flex flex-col right-0 mt-2 mr-2 w-auto origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bg-primary-background">
              {status === 'loading' ? (
                'Loading'
              ) : session?.user ? (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <MyLink href="/account-settings" active>
                        Account settings
                      </MyLink>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <MyLink href="/signout" active={active}>
                        Logout
                      </MyLink>
                    )}
                  </Menu.Item>
                </>
              ) : (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <MyLink href="/api/auth/signin" active={active}>
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