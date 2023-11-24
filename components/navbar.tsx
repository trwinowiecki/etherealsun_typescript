/* eslint-disable jsx-a11y/anchor-is-valid */

import { Menu, Transition } from '@headlessui/react';
import { ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Session, User, useSupabaseClient } from '@supabase/auth-helpers-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { forwardRef, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import axios, { AxiosResponse } from 'axios';
import {
  CreateCustomerResponse,
  RetrieveCustomerResponse,
  SearchCustomersResponse
} from 'square';
import { CartCommand } from '../enums/cart-commands';
import { SquareCommand } from '../enums/square-commands';
import { UserCustom } from '../types/supabase';
import { Database } from '../types/supabase-data';
import { useStoreContext } from '../utils/store';
import { cn } from '../utils/tw-utils';

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
        className={cn('py-2 px-4', { 'bg-primary-background-darker': active })}
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
      className={cn('py-2 px-4 text-left !rounded-none', {
        'bg-primary-background-darker': active
      })}
      type="button"
    >
      {children}
    </button>
  );
});

function Navbar() {
  const router = useRouter();
  const { state, dispatch } = useStoreContext();
  const supabase = useSupabaseClient<Database>();
  const [idempotencyKey, setIdempotencyKey] = useState(crypto.randomUUID());
  const {
    cart: { cartItems }
  } = state;

  useEffect(() => {
    const getSquareCustomer = async (user: UserCustom) => {
      const data: AxiosResponse<RetrieveCustomerResponse> = await axios.request(
        {
          method: 'POST',
          url: '/api/square',
          data: {
            type: SquareCommand.GET_CUSTOMER,
            id: user.square_id
          }
        }
      );

      if (data && data.data) {
        user = {
          ...user,
          square_customer: data.data.customer || {}
        };
      }

      return user;
    };

    const createSquareCustomer = async (user: UserCustom) => {
      const data: AxiosResponse<CreateCustomerResponse> = await axios.request({
        method: 'POST',
        url: '/api/square',
        data: {
          type: SquareCommand.CREATE_CUSTOMER,
          customer: user,
          idempotencyKey
        }
      });

      if (data && data.data && data.data.customer) {
        user = {
          ...user,
          square_id: data.data.customer?.id || '',
          square_customer: data.data.customer || {}
        };
      }

      return user;
    };

    const initSquareCustomer = async (user: UserCustom) => {
      const data: AxiosResponse<SearchCustomersResponse> = await axios.request({
        method: 'POST',
        url: '/api/square',
        data: {
          type: SquareCommand.SEARCH_FOR_USER,
          email: user.email,
          refId: user.id
        }
      });

      if (data && data.data && data.data.customers && data.data.customers[0]) {
        user = {
          ...user,
          square_id: data.data.customers[0].id || '',
          square_customer: data.data.customers[0] || {}
        };
      } else {
        user = await createSquareCustomer(user);
      }

      if (user.square_id) {
        await supabase
          .from('profiles')
          .update({ square_id: user.square_id })
          .eq('id', user.id);
      }

      return user;
    };

    const getUser = async (sessionUser: User) => {
      let user: UserCustom = sessionUser as UserCustom;
      const res = await supabase
        .from('profiles')
        .select()
        .eq('id', sessionUser.id);

      if (res && res.data && res.data[0]) {
        user = { ...res.data[0], ...user };
      }

      if (user.square_id) {
        user = await getSquareCustomer(user);
      } else {
        user = await initSquareCustomer(user);
      }

      const favorites = await supabase
        .from('favorite_products')
        .select('product_id')
        .eq('user_id', user.id);

      user = {
        ...user,
        favorites: favorites.data?.map(fav => fav.product_id) || []
      };

      return user;
    };

    const dispatchUser = async (session: Session | null) => {
      dispatch({
        type: CartCommand.SET_USER,
        payload: await getUser(session?.user as User)
      });
    };

    const updateUser = async () => {
      await axios({
        method: 'POST',
        url: '/api/square',
        data: {
          type: SquareCommand.UPDATE_CUSTOMER,
          customer: state.user,
          id: state.user.square_id,
          address: state.cart.shippingAddress
        }
      });
    };

    supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === 'SIGNED_IN' ||
          event === 'INITIAL_SESSION' ||
          event === 'USER_UPDATED') &&
        session?.user.id !== state.user?.id
      ) {
        dispatchUser(session);
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: CartCommand.SET_USER, payload: null });
      }

      if (event === 'USER_UPDATED') {
        updateUser();
      }
    });
  }, []);

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
              className={cn('top-1 right-1 hidden absolute', {
                block: cartItems.length > 0
              })}
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
              {state.user?.first_name && (
                <span className="pl-2">{state.user.first_name}</span>
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
              {state.user ? (
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
