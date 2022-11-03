import CartItemComponent from '@ui/CartItemComponent';
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
        <div>
          <h1 className="text-4xl tracking-wide mb-4">Your bag</h1>
          {!cartItems || cartItems.length === 0 ? (
            <div className="w-full h-full bg-primary-background-darker rounded-md shadow-md p-4">
              <span className="text-2xl">No treasures here yet!</span>
              <div className="text-2xl font-bold">
                <Link href="/">Go hunting!</Link>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col bg-primary-background-darker rounded-md overflow-hidden shadow-md">
              {cartItems.slice().map(item => {
                return <CartItemComponent key={item.id} item={item} />;
              })}
            </div>
          )}
        </div>
      </>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Cart), { ssr: false });
