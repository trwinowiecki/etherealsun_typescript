import { useEffect, useState } from 'react';
import { CreditCard } from 'react-square-web-payments-sdk';

import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { PaymentRequestOptions } from '@square/web-sdk';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/auth-helpers-react';
import Button from '@ui/Button';
import axios from 'axios';
import { useRouter } from 'next/router';
import AddressForm from '../components/AddressForm';
import CheckoutSteps from '../components/CheckoutSteps';
import Layout from '../components/Layout';
import SquarePaymentForm from '../components/SquarePaymentForm';
import { CartCommand } from '../enums/CartCommands';
import { ShippoCommand } from '../enums/ShippoCommands';
import { Database } from '../types/SupabaseDbTypes';
import { useStoreContext } from '../utils/Store';
import { getLineItems, getTotalPrice } from '../utils/cart-utils';
import { convertSquareToShippoAddress } from '../utils/shippo-utils';
import { ShippoShipmentResponse } from './api/shippo';

type CheckoutProps = {
  initialUser: User | null;
};

const checkout = ({ initialUser }: CheckoutProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState([
    { title: 'Account', enabled: true },
    { title: 'Address', enabled: false },
    { title: 'Shipping Options', enabled: false },
    { title: 'Payment', enabled: false },
    { title: 'Review', enabled: false }
  ]);

  const [address, setAddress] = useState<AddressForm>({});
  const { state, dispatch } = useStoreContext();
  const router = useRouter();

  useEffect(() => {
    if (!initialUser?.id) {
      router.push('/account?callbackUrl=/checkout');
    }
  }, []);

  const handleStepChange = (newStep: number) => {
    if (newStep < steps.length && newStep >= 0) {
      // todo validate previous step is complete

      setActiveStep(newStep);

      if (!steps[newStep].enabled) {
        setSteps(prev =>
          prev.map((step, i) =>
            i == newStep ? { ...step, enabled: true } : step
          )
        );
      }
    }
  };

  const addressSubmit = (address: AddressForm) => {
    dispatch({ type: CartCommand.SAVE_SHIPPING_ADDRESS, payload: address });
    setAddress(address);
    handleStepChange(activeStep + 1);
  };

  const paymentOptions = (): PaymentRequestOptions => {
    return {
      countryCode: state.cart.shippingAddress?.country || 'US',
      currencyCode: 'USD',
      total: {
        amount: getTotalPrice(state.cart.cartItems),
        label: 'total'
      },
      requestBillingContact: true,
      shippingContact: state.cart.shippingAddress,
      lineItems: getLineItems(state.cart)
    };
  };

  const renderSwitch = () => {
    switch (steps[activeStep].title) {
      case 'Account':
        if (state.user?.id) {
          handleStepChange(activeStep + 1);
          return;
        }
      case 'Address':
        return (
          <AddressForm
            onSubmit={addressSubmit}
            user={state.user!}
            address={address}
          />
        );
      case 'Shipping Options': {
        return <ShippingOptions></ShippingOptions>;
      }
      case 'Payment':
        return (
          <SquarePaymentForm createPaymentRequest={paymentOptions}>
            <CreditCard />
          </SquarePaymentForm>
        );
      case 'Review':
        return <div>Review</div>;
    }
  };

  return (
    <Layout title="Checkout">
      <section>
        <CheckoutSteps activeStep={activeStep} steps={steps} />
        {renderSwitch()}
        <Button type="button" onClick={() => handleStepChange(activeStep + 1)}>
          +
        </Button>
        <Button type="button" onClick={() => handleStepChange(activeStep - 1)}>
          -
        </Button>
      </section>
    </Layout>
  );
};

const ShippingOptions = () => {
  const { state } = useStoreContext();
  type ShippoRates = ShippoShipmentResponse['rates'];
  const [rates, setRates] = useState<ShippoRates>([]);
  console.log('state shipping address', state.cart.shippingAddress);

  useEffect(() => {
    const getRates = async () => {
      const data = await axios({
        method: 'POST',
        url: 'api/shippo',
        data: {
          type: ShippoCommand.CREATE_SHIPMENT,
          addressTo: convertSquareToShippoAddress(state.cart.shippingAddress)
        }
      });

      if (data.status >= 400) {
        console.log('error getting rates', data);
        return;
      }

      if (data.data.rates) {
        setRates(data.data.rates);
      }
    };

    getRates();
  }, [state.cart.shippingAddress.addressLine1]);

  const getSortedRates = (): Map<string, ShippoRates> => {
    const map = new Map<string, ShippoRates>();

    rates?.forEach(rate => {
      const key = rate.provider!;
      if (map.has(key)) {
        const existing = map.get(key);
        if (existing) {
          map.set(
            key,
            [...existing, rate].sort(
              (a, b) =>
                Number.parseFloat(a.amount!) - Number.parseFloat(b.amount!)
            )
          );
        }
      } else {
        map.set(key, [rate]);
      }
    });

    return map;
  };

  return (
    <>
      {Array.from(getSortedRates().entries()).map(([carrier, rates]) => (
        <div key={carrier}>
          <div className="flex items-center h-10 gap-2">
            <img
              src={
                rates && rates[0].provider_image_200
                  ? rates[0].provider_image_200
                  : ''
              }
              alt={carrier}
              height="75px"
              sizes=""
              className="h-10"
            />
            <h3>{carrier}</h3>
          </div>
          {rates?.map(rate => (
            <div key={rate.object_id}>
              <input
                type="radio"
                name="shippingOption"
                value={rate.object_id}
                id={rate.object_id}
              />
              <label htmlFor={rate.object_id}>
                ${rate.amount} - {rate.servicelevel?.name}{' '}
                <QuestionMarkCircleIcon className="inline w-4 h-4" />
              </label>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export async function getServerSideProps(context: any) {
  // Fetch user authentication data from Supabase on the server-side
  const supabase = createServerSupabaseClient<Database>(context);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return {
    props: {
      initialUser: user // Pass the user data as a prop
    }
  };
}

export default checkout;
