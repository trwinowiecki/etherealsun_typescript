import { CreditCard } from 'react-square-web-payments-sdk';

import Layout from '../components/Layout';
import SquarePaymentForm from '../components/SquarePaymentForm';

const checkout = () => {
  return (
    <Layout title="Checkout">
      <SquarePaymentForm>
        <CreditCard />
      </SquarePaymentForm>
    </Layout>
  );
};

export default checkout;
