import Button from '@ui/Button';
import CartItemComponent from '@ui/cart/CartItemComponent';
import Subtotal from '@ui/cart/Subtotal';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { GooglePay } from 'react-square-web-payments-sdk';

import Layout from '../components/Layout';
import SquarePaymentForm from '../components/SquarePaymentForm';
import { Store } from '../utils/Store';

const Cart = () => {
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems }
  } = state;
  const router = useRouter();

  return (
    <Layout title="Cart">
      <>
        <h1 className="mb-4 text-4xl tracking-wide">Your bag</h1>
        {!cartItems || cartItems.length === 0 ? (
          <div className="w-full p-4 rounded-md shadow-md bg-primary-background-darker">
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
                <SquarePaymentForm
                  createPaymentRequest={() => ({
                    countryCode: 'US',
                    currencyCode: 'USD',
                    lineItems: [
                      {
                        amount: '22.15',
                        label: 'Item to be purchased',
                        id: 'SKU-12345',
                        imageUrl: 'https://url-cdn.com/123ABC',
                        pending: true,
                        productUrl: 'https://my-company.com/product-123ABC'
                      }
                    ],
                    taxLineItems: [
                      {
                        label: 'State Tax',
                        amount: '8.95',
                        pending: true
                      }
                    ],
                    discounts: [
                      {
                        label: 'Holiday Discount',
                        amount: '5.00',
                        pending: true
                      }
                    ],
                    requestBillingContact: false,
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
                      amount: '41.79',
                      label: 'Total'
                    }
                  })}
                >
                  <div className="flex flex-col gap-2 mt-2">
                    <Button
                      type="button"
                      onClick={() => router.push('/checkout')}
                      extraClasses="w-full"
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
      </>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Cart), { ssr: false });
