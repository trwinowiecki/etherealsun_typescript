import { OldCartItem } from './CartItem';

export interface Cart {
  cartItems: OldCartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  popUp: boolean;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
}
