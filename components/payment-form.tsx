import {
  ChargeVerifyBuyerDetails,
  TokenResult,
  VerifyBuyerResponseDetails
} from '@square/web-sdk';
import axios from 'axios';
import { useState } from 'react';
import { PaymentForm, PaymentFormProps } from 'react-square-web-payments-sdk';
import { SquareCommand } from '../enums/square-commands';
import { getTotalPrice } from '../utils/cart-utils';
import { useStoreContext } from '../utils/store';

type SquarePaymentFormProps = Omit<
  PaymentFormProps,
  'applicationId' | 'cardTokenizeResponseReceived' | 'locationId'
>;

const SquarePaymentForm = ({ children, ...props }: SquarePaymentFormProps) => {
  const { state } = useStoreContext();
  const [idempotencyKey, setIdempotencyKey] = useState(crypto.randomUUID());

  const handleCardTokenizeResponseReceived = (
    token: TokenResult,
    verifiedBuyer?: VerifyBuyerResponseDetails | null | undefined
  ) => {
    console.info('Token:', token);
    console.info('Verified Buyer:', verifiedBuyer);
    takePayment(token.token || '');
  };

  const handleCreateVerificationDetails = (): ChargeVerifyBuyerDetails => {
    return {
      amount: getTotalPrice(state.cart.cartItems),
      currencyCode: 'USD',
      intent: 'CHARGE',
      billingContact: {
        ...state.user.square_customer
      }
    };
  };

  const takePayment = async (token: string) => {
    const res = await axios('/api/square', {
      method: 'POST',
      data: {
        type: SquareCommand.TAKE_PAYMENT,
        token,
        amount: getTotalPrice(state.cart.cartItems),
        idempotencyKey
      }
    });
    console.log(res);
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
