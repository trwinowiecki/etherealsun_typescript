import { useEffect, useState } from 'react';
import { CreditCard } from 'react-square-web-payments-sdk';

import {
  ArrowLeftIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { PaymentRequestOptions } from '@square/web-sdk';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/auth-helpers-react';
import Button from '@ui/button';
import CustomRadio, { RadioOption } from '@ui/radio-buttons';
import Tooltip from '@ui/tooltip';
import axios from 'axios';
import { useRouter } from 'next/router';
import AddressForm from '../components/address-form';
import HorizontalSteps from '../components/horizontal-stepper';
import Layout from '../components/layout';
import SquarePaymentForm from '../components/payment-form';
import { CartCommand } from '../enums/cart-commands';
import { ShippoCommand } from '../enums/shippo-commands';
import { Database } from '../types/supabase-data';
import { getLineItems, getTotalPrice } from '../utils/cart-utils';
import { convertSquareToShippoAddress } from '../utils/shippo-utils';
import { useStoreContext } from '../contexts/store';
import { ShippoRate } from './api/shippo';

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
  const [shippingRate, setShippingRate] = useState<ShippoRate>();
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

  const shippingRateSubmit = (rate: ShippoRate) => {
    setShippingRate(rate);
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
        return (
          <ShippingOptions submitRate={shippingRateSubmit}></ShippingOptions>
        );
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
      <section className="flex flex-col items-start gap-2">
        <HorizontalSteps activeStep={activeStep} steps={steps} />
        <Button type="button" onClick={() => handleStepChange(activeStep - 1)}>
          <ArrowLeftIcon className="inline w-4 h-4 mr-2" />
          Back
        </Button>
        {renderSwitch()}
      </section>
    </Layout>
  );
};

type ShippingOptionsProps = {
  submitRate: (val: ShippoRate) => void;
};

const ShippingOptions = ({ submitRate }: ShippingOptionsProps) => {
  const { state } = useStoreContext();
  const [rates, setRates] = useState<ShippoRate[]>([]);
  console.log('state shipping address', state.cart.shippingAddress);
  const [selectedRate, setSelectedRate] = useState<ShippoRate>();

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

  const getSortedRates = (): Map<string, ShippoRate[]> => {
    const map = new Map<string, ShippoRate[]>();

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

  const getRadioOptions = (rates: ShippoRate[]): RadioOption<ShippoRate>[] => {
    return rates!.map(rate => ({
      key: rate.object_id!,
      value: rate,
      displayValue: (
        <span className="flex items-center gap-1">
          ${rate.amount} - {rate.servicelevel?.name}{' '}
          <Tooltip text={rate.duration_terms || ''}>
            <QuestionMarkCircleIcon className="inline h-5" />
          </Tooltip>
        </span>
      )
    }));
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:w-full md:justify-evenly">
        {Array.from(getSortedRates().entries()).map(([carrier, rates]) => (
          <div key={carrier} className="flex flex-col gap-2">
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
            <CustomRadio
              options={getRadioOptions(rates)}
              selected={selectedRate}
              setSelected={val => setSelectedRate(val)}
            />
          </div>
        ))}
      </div>
      <Button
        type="submit"
        onClick={() => submitRate(selectedRate!)}
        disabled={!selectedRate}
        className="w-full"
      >
        Submit
      </Button>
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
