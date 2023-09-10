import {
  ChargeVerifyBuyerDetails,
  TokenResult,
  VerifyBuyerResponseDetails
} from '@square/web-sdk';
import { PaymentForm, PaymentFormProps } from 'react-square-web-payments-sdk';
import { useStoreContext } from '../utils/Store';
import { getTotalPrice } from '../utils/cart-utils';

type SquarePaymentFormProps = Omit<
  PaymentFormProps,
  'applicationId' | 'cardTokenizeResponseReceived' | 'locationId'
>;

const SquarePaymentForm = ({ children, ...props }: SquarePaymentFormProps) => {
  const { state } = useStoreContext();

  const handleCardTokenizeResponseReceived = (
    token: TokenResult,
    verifiedBuyer?: VerifyBuyerResponseDetails | null | undefined
  ) => {
    console.info('Token:', token);
    console.info('Verified Buyer:', verifiedBuyer);
    throw new Error('Function not implemented.');
  };

  const handleCreateVerificationDetails = (): ChargeVerifyBuyerDetails => {
    return {
      amount: getTotalPrice(state.cart.cartItems),
      currencyCode: 'USD',
      intent: 'CHARGE',
      billingContact: {}
    };
  };

  return (
    <PaymentForm
      {...props}
      applicationId={process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ''}
      cardTokenizeResponseReceived={handleCardTokenizeResponseReceived}
      createVerificationDetails={handleCreateVerificationDetails}
      locationId={process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ''}
    >
      {children}
    </PaymentForm>
  );
};

export default SquarePaymentForm;
