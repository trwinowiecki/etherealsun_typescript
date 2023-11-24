import AddressForm from '../components/address-form';
import { CartItem } from './cart-item';

export interface Cart {
  cartItems: CartItem[];
  shippingAddress: AddressForm;
  paymentMethod: string;
  popUp: boolean;
}
