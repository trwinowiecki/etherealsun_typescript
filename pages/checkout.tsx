import { useEffect, useState } from 'react';
import { CreditCard } from 'react-square-web-payments-sdk';

import { useUser } from '@supabase/auth-helpers-react';
import Button from '@ui/Button';
import { useRouter } from 'next/router';
import { Address } from 'square';
import AddressForm from '../components/AddressForm';
import CheckoutSteps from '../components/CheckoutSteps';
import Layout from '../components/Layout';
import SquarePaymentForm from '../components/SquarePaymentForm';
import { useStoreContext } from '../utils/Store';

const checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState([
    { title: 'Account', enabled: true },
    { title: 'Address', enabled: false },
    { title: 'Payment', enabled: false },
    { title: 'Review', enabled: false }
  ]);

  const [address, setAddress] = useState<AddressForm>({});
  const { state } = useStoreContext();
  const userAuth = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userAuth?.id) {
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

  const addressSubmit = (address: Address) => {
    setAddress(address);
    console.log('address', address);
    handleStepChange(activeStep + 1);
  };

  const renderSwitch = () => {
    switch (steps[activeStep].title) {
      case 'Account':
        if (state.user.id) {
          handleStepChange(activeStep + 1);
          return;
        }
      case 'Address':
        console.log('user', state.user);
        return (
          <AddressForm
            onSubmit={addressSubmit}
            user={state.user!}
            address={address}
          />
        );
      case 'Payment':
        return (
          <SquarePaymentForm>
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

export default checkout;
