import CartItemComponent from '@ui/cart/CartItemComponent';
import Subtotal from '@ui/cart/Subtotal';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useContext } from 'react';

import Layout from '../components/Layout';
import { CartCommands } from '../enums/CartCommands';
import { CartItem } from '../types/CartItem';
import { Store } from '../utils/Store';

interface Props {}

const Cart: NextPage<Props> = ({}) => {
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems }
  } = state;

  const handleQuantityUpdate = async (
    selectedItem: CartItem,
    quantity: number
  ) => {
    dispatch({
      type: CartCommands.UPDATE,
      payload: {
        ...selectedItem,
        quantity,
        relatedObjects: selectedItem.relatedObjects
      }
    });
  };

  return (
    <Layout title="Cart">
      <>
        <h1 className="mb-4 text-4xl tracking-wide">Your bag</h1>
        {!cartItems || cartItems.length === 0 ? (
          <div className="w-full h-full p-4 rounded-md shadow-md bg-primary-background-darker">
            <span className="text-2xl">No treasures here yet!</span>
            <div className="text-2xl font-bold">
              <Link href="/">Go hunting!</Link>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col gap-4 mb-4 md:items-start md:flex-row">
            <div className="w-full flex-[3] flex flex-col bg-primary-background-darker rounded-md overflow-hidden shadow-md">
              {cartItems.slice().map(item => {
                return <CartItemComponent key={item.id} item={item} />;
              })}
            </div>
            <div className="flex flex-col flex-1 gap-4 md:sticky md:top-16">
              <Subtotal cartItems={cartItems} />
              <div className="w-full p-4 rounded-md shadow-md bg-primary-background-darker">
                <h1 className="text-2xl">Checkout</h1>
                <div>checkout options</div>
                <div>checkout options</div>
                <div>checkout options</div>
                <div>checkout options</div>
                <div>checkout options</div>
              </div>
            </div>
          </div>
        )}
      </>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Cart), { ssr: false });
