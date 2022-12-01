import { Menu, Transition } from '@headlessui/react';
import { ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/outline';
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
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems }
  } = state;

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
          <Menu.Button className="flex items-center h-full">
            {status === 'loading'
              ? 'Loading'
              : session?.user
              ? session.user.name
              : ''}
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
