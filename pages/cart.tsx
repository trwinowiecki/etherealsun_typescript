import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';
import { CatalogObject } from 'square';
import Layout from '../components/Layout';
import { getImages } from '../utils/images';
import { Store } from '../utils/Store';

interface Props {}

interface CartImages {
  itemId: string;
  imageObjects: CatalogObject[];
}

const Cart: NextPage<Props> = ({}) => {
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems }
  } = state;

  return (
    <Layout title="Cart">
      <>
        <div>
          <h1>Cart</h1>
          {!cartItems || cartItems.length === 0 ? (
            <div>
              Your cart is empty <Link href="/">Go shopping</Link>
            </div>
          ) : (
            <div className="w-full flex flex-col">
              {cartItems.map(item => {
                return (
                  <div key={item.id}>
                    <Image
                      width={50}
                      height={50}
                      objectFit="cover"
                      src={
                        getImages(item, item.relatedObjects)[0].imageData?.url!
                      }
                      alt={item.itemData?.name}
                    />
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
