import AddressForm from '../components/AddressForm';
import { CartItem } from './CartItem';

export interface Cart {
  cartItems: CartItem[];
  shippingAddress: AddressForm;
  paymentMethod: string;
  popUp: boolean;
}
