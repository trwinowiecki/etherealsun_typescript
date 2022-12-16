import { useState } from 'react';
import { CreditCard } from 'react-square-web-payments-sdk';

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

  const handleStepChange = (newStep: number) => {
    if (newStep < steps.length && newStep >= 0) {
      setActiveStep(newStep);

      if (!steps[newStep].enabled) {
        setSteps(prev => [
          ...prev.filter(step => step.title !== prev[newStep].title),
          { title: prev[newStep].title, enabled: true }
        ]);
      }
    }
  };

  return (
    <Layout title="Checkout">
      <CheckoutSteps activeStep={activeStep} steps={steps} />
      <button type="button" onClick={() => handleStepChange(activeStep + 1)}>
        +
      </button>
      <button type="button" onClick={() => handleStepChange(activeStep - 1)}>
        -
      </button>
      <SquarePaymentForm>
        <CreditCard />
      </SquarePaymentForm>
    </Layout>
  );
};

export default checkout;
