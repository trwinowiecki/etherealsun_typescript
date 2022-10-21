import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';
import CustomListbox from '../components/CustomListbox';
import Layout from '../components/Layout';
import { CartCommands } from '../enums/CartCommands';
import { CartItem } from '../types/CartItem';
import { getImages } from '../utils/images';
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
            <div className="w-full h-full bg-sec-background rounded-md shadow-md p-4">
              <span className="text-2xl">No treasures here yet!</span>
              <div className="text-2xl font-bold">
                <Link href="/">Go hunting!</Link>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col bg-sec-background rounded-md overflow-hidden shadow-md">
              {cartItems.map(item => {
                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center gap-2 p-2 px-4"
                  >
                    <div key={item.id} className="flex items-center gap-2">
                      <Link href={`/product/${item.id}`}>
                        <a>
                          <Image
                            width={50}
                            height={50}
                            objectFit="cover"
                            src={
                              getImages(item, item.relatedObjects)[0].imageData
                                ?.url!
                            }
                            alt={item.itemData?.name}
                          />
                        </a>
                      </Link>
                      <div className="flex flex-col gap-1">
                        <Link href={`/product/${item.id}`}>
                          <a>
                            <span>{item.itemData?.name}</span>
                          </a>
                        </Link>
                        <CustomListbox
                          listOfItems={[1, 2, 3, 4, 5]}
                          state={item.quantity}
                          setState={(newQuantity: number) =>
                            handleQuantityUpdate(item, newQuantity)
                          }
                        />
                      </div>
                    </div>
                    <span className="">
                      $
                      {Number(
                        item.itemData?.variations![0].itemVariationData
                          ?.priceMoney?.amount
                      ) / 100}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Cart), { ssr: false });
