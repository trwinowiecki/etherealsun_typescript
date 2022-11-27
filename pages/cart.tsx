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
        <h1 className="text-4xl tracking-wide mb-4">Your bag</h1>
        {!cartItems || cartItems.length === 0 ? (
          <div className="w-full h-full bg-primary-background-darker rounded-md shadow-md p-4">
            <span className="text-2xl">No treasures here yet!</span>
            <div className="text-2xl font-bold">
              <Link href="/">Go hunting!</Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:items-start md:flex-row">
            <div className="w-full flex-[3] flex flex-col bg-primary-background-darker rounded-md overflow-hidden shadow-md">
              {cartItems.slice().map(item => {
                return <CartItemComponent key={item.id} item={item} />;
              })}
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="w-full bg-primary-background-darker rounded-md shadow-md p-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl">Subtotal</h1>
                  <div>
                    $
                    {cartItems.reduce(
                      (acc, item) =>
                        (acc +=
                          (Number(
                            item.itemData?.variations![0].itemVariationData
                              ?.priceMoney?.amount
                          ) *
                            item.quantity) /
                          100),
                      0
                    )}
                  </div>
                </div>
                <div className="text-xs">
                  Taxes and shipping calculated at checkout
                </div>
              </div>
              <div className="w-full bg-primary-background-darker rounded-md shadow-md p-4">
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
