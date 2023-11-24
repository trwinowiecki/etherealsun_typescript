import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Button from '@ui/button';
import CartItemComponent from '@ui/cart/cart-item';
import Subtotal, { calcSubtotal } from '@ui/cart/subtotal';
import Featured from '@ui/featured-products';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GooglePay } from 'react-square-web-payments-sdk';
import { toast } from 'react-toastify';
import { BatchRetrieveCatalogObjectsResponse } from 'square';

import dynamic from 'next/dynamic';
import Layout from '../components/layout';
import SquarePaymentForm from '../components/payment-form';
import { SquareCommand } from '../enums/square-commands';
import { Database } from '../types/supabase-data';
import { useStoreContext } from '../contexts/store';
import { handleError } from '../utils/supabase-utils';

const Cart = () => {
  const router = useRouter();
  const { state, dispatch } = useStoreContext();
  const {
    cart: { cartItems }
  } = state;
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [favorites, setFavorites] =
    useState<BatchRetrieveCatalogObjectsResponse>();

  useEffect(() => {
    const getFavProducts = async (signal: AbortSignal) => {
      const res = await supabase
        .from('favorite_products')
        .select()
        .abortSignal(signal);

      if (res.error) {
        handleError(res.error);
        return;
      }

      const validProducts = res.data.filter(
        fav => !cartItems.find(item => item.variationId === fav.product_id)
      );

      if (validProducts.length === 0) {
        setFavorites(undefined);
        return;
      }

      await axios<BatchRetrieveCatalogObjectsResponse>({
        method: 'POST',
        url: `/api/square`,
        data: {
          type: SquareCommand.GET_BATCH_CATALOG,
          ids: validProducts.map(fav => fav.product_id)
        }
      })
        .then(({ data }) => {
          setFavorites(data);
        })
        .catch(error => toast.error(error));
    };

    const controller = new AbortController();
    if (user) {
      getFavProducts(controller.signal);
    }

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cartItems]);

  return (
    <Layout title="Cart">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl tracking-wide">Your bag</h1>
        {!cartItems || cartItems.length === 0 ? (
          <div className="w-full p-4 rounded-md shadow-md bg-primary-background-darker">
            <span className="text-2xl">No treasures here yet!</span>
            <div className="text-2xl font-bold">
              <Link href="/">Go hunting!</Link>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col gap-4 md:items-start md:flex-row">
            <div className="w-full flex-[3] flex flex-col bg-primary-background-darker rounded-md overflow-hidden shadow-md">
              {cartItems.slice().map(item => {
                return <CartItemComponent key={item.variationId} item={item} />;
              })}
            </div>
            <div className="flex flex-col flex-1 gap-4 md:sticky md:top-16">
              <Subtotal cartItems={cartItems} />
              <div className="w-full p-4 rounded-md shadow-md bg-primary-background-darker">
                <h1 className="text-2xl">Checkout</h1>
                <SquarePaymentForm
                  createPaymentRequest={() => ({
                    countryCode: 'US',
                    currencyCode: 'USD',
                    lineItems: cartItems.map(item => ({
                      amount: (
                        (Number(item.price) * item.quantity) /
                        100
                      ).toString(),
                      label: `${item.name!} x ${item.quantity}`,
                      id: item.variationId,
                      imageUrl: item.images[0].url,
                      productUrl: ``
                    })),
                    requestShippingContact: true,
                    shippingOptions: [
                      {
                        label: 'Next Day',
                        amount: '15.69',
                        id: '1'
                      },
                      {
                        label: 'Three Day',
                        amount: '2.00',
                        id: '2'
                      }
                    ],
                    // pending is only required if it's true.
                    total: {
                      amount: calcSubtotal(cartItems).toString(),
                      label: 'Total'
                    }
                  })}
                >
                  <div className="flex flex-col gap-2 mt-2">
                    <Button
                      type="button"
                      onClick={() => router.push('/checkout')}
                      className="w-full"
                    >
                      Checkout
                    </Button>
                    <GooglePay />
                    {/* <ApplePay /> */}
                  </div>
                </SquarePaymentForm>
              </div>
            </div>
          </div>
        )}
        {favorites ? (
          <div className="w-full p-4 rounded-md shadow-md bg-primary-background-darker">
            <Featured
              name="Other Favorites"
              products={favorites.objects!}
              relatedObjs={favorites.relatedObjects!}
              hasCartButton
            />
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Cart), { ssr: false });
