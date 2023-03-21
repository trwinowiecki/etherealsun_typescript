/* eslint-disable jsx-a11y/anchor-is-valid */

import { Menu, Transition } from '@headlessui/react';
import { ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import {
  useSession,
  useSupabaseClient,
  useUser
} from '@supabase/auth-helpers-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { forwardRef, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { CartCommand } from '../enums/CartCommands';
import { Database } from '../types/SupabaseDbTypes';
import { Store } from '../utils/Store';
import { handleError } from '../utils/supabaseUtils';

type Profile = Database['public']['Tables']['profiles']['Row'];
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

interface MyButtonProps extends React.HTMLProps<HTMLButtonElement> {
  onClick: () => void;
  active: boolean;
}

const MyButton = forwardRef<HTMLButtonElement, MyButtonProps>((props, ref) => {
  const { onClick, active, children } = props;

  return (
    <button
      onClick={onClick}
      className={`${
        active ? 'bg-primary-background-darker' : ''
      } py-2 px-4 text-left !rounded-none`}
      type="button"
    >
      {children}
    </button>
  );
});

function Navbar() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const session = useSession();
  const user = useUser();
  const supabase = useSupabaseClient<Database>();
  const [userProfile, setUserProfile] = useState<Profile>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    if (session) {
      getProfile(controller.signal);
    }

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function getProfile(signal: AbortSignal) {
    setLoading(true);

    const { data, error, status } = await supabase
      .from('profiles')
      .select()
      .eq('id', user?.id)
      .abortSignal(signal)
      .single();

    if (error && status !== 406) {
      handleError(error);
    }

    if (data) {
      setUserProfile(data);
    }

    setLoading(false);
  }

  const {
    cart: { cartItems }
  } = state;

  const handleSignOut = async () => {
    try {
      supabase.auth.signOut().catch(err => toast.error(err));
      dispatch({
        type: CartCommand.CLEAR
      });
    } catch (error: any) {
      toast.error(error);
    } finally {
      router.reload();
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
              {userProfile?.first_name && (
                <span className="pl-2">{userProfile.first_name}</span>
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
            <Menu.Items className="absolute z-30 flex flex-col justify-start w-auto mt-4 overflow-hidden origin-top-right rounded-md shadow-lg right-4 ring-1 ring-black ring-opacity-5 focus:outline-none bg-primary-background">
              {userProfile ? (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <MyLink href="/account" active={active}>
                        My Account
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
                      <MyLink
                        href={`/account?callbackUrl=${router.asPath}`}
                        active={active}
                      >
                        Sign In
                      </MyLink>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <MyLink
                        href={`account?callbackUrl=${router.asPath}&view=sign_up`}
                        active={active}
                      >
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
