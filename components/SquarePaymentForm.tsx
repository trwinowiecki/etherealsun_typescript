import { TokenResult, VerifyBuyerResponseDetails } from '@square/web-sdk';
import { PaymentForm, PaymentFormProps } from 'react-square-web-payments-sdk';

interface SquarePaymentFormProps
  extends Omit<
    PaymentFormProps,
    'applicationId' | 'cardTokenizeResponseReceived' | 'locationId'
  > {}

const SquarePaymentForm = ({ children, ...props }: SquarePaymentFormProps) => {
  return (
    <PaymentForm
      {...props}
      applicationId="sandbox-sq0idb-QQj2hsS8eecoEziUGE0ufw"
      cardTokenizeResponseReceived={(
        token: TokenResult,
        verifiedBuyer?: VerifyBuyerResponseDetails | null | undefined
      ) => {
        console.info('Token:', token);
        console.info('Verified Buyer:', verifiedBuyer);
        throw new Error('Function not implemented.');
      }}
      locationId="LQC4A379XHYGD"
    >
      {children}
    </PaymentForm>
  );
};

export default SquarePaymentForm;
