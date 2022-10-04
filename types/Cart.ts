import { CartItem } from './CartItem';

export interface Cart {
  cartItems: CartItem[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
}
