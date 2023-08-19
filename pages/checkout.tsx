import { useState } from 'react';
import { CreditCard } from 'react-square-web-payments-sdk';

import Button from '@ui/Button';
import { Address } from 'square';
import AddressForm from '../components/AddressForm';
import CheckoutSteps from '../components/CheckoutSteps';
import Layout from '../components/Layout';
import SquarePaymentForm from '../components/SquarePaymentForm';

const checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState([
    { title: 'Account', enabled: true },
    { title: 'Address', enabled: false },
    { title: 'Payment', enabled: false },
    { title: 'Review', enabled: false }
  ]);

  const [address, setAddress] = useState<AddressForm>({});

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
    handleStepChange(activeStep + 1);
  };

  return (
    <Layout title="Checkout">
      <CheckoutSteps activeStep={activeStep} steps={steps} />
      {steps[activeStep].title === 'Address' ? (
        <AddressForm onSubmit={addressSubmit} />
      ) : null}
      {steps[activeStep].title === 'Payment' ? (
        <SquarePaymentForm>
          <CreditCard />
        </SquarePaymentForm>
      ) : null}
      <Button type="button" onClick={() => handleStepChange(activeStep + 1)}>
        +
      </Button>
      <Button type="button" onClick={() => handleStepChange(activeStep - 1)}>
        -
      </Button>
    </Layout>
  );
};

export default checkout;
