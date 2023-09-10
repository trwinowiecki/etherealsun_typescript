import { LineItem } from '@square/web-sdk';
import { Cart } from '../types/Cart.model';
import { CartItem } from '../types/CartItem';

export const getTotalPrice = (cartItems: CartItem[]): string => {
  return (
    cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0) / 100
  ).toFixed(2);
};

export const getLineItems = (cart: Cart): LineItem[] => {
  return cart.cartItems.map(item => getLineItem(item));
};

export const getLineItem = (cartItem: CartItem): LineItem => {
  return {
    amount: getTotalPrice([cartItem]),
    id: cartItem.variationId,
    imageUrl: cartItem.images[0].url || '',
    label: cartItem.variationName,
    productUrl:
      process.env.NEXT_PUBLIC_BASE_URL + '/product/' + cartItem.catalogObjectId
  };
};
