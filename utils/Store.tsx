import { createContext, useMemo, useReducer } from 'react';

import { CartCommand } from '../enums/CartCommands';
import { Cart, ShippingAddress } from '../types/Cart.model';
import { OldCartItem } from '../types/CartItem';

interface StoreContextInterface {
  state: State;
  dispatch: React.Dispatch<any>;
}

interface State {
  cart: Cart;
}

type Action =
  | { type: CartCommand.ADD; payload: OldCartItem }
  | { type: CartCommand.UPDATE; payload: OldCartItem }
  | { type: CartCommand.REMOVE; payload: OldCartItem }
  | { type: CartCommand.RESET }
  | { type: CartCommand.CLEAR; payload: OldCartItem }
  | {
      type: CartCommand.SAVE_SHIPPING_ADDRESS;
      payload: ShippingAddress;
    }
  | { type: CartCommand.SAVE_PAYMENT_METHOD; payload: string }
  | { type: CartCommand.POP_UP; payload: boolean };

const initialState: State = {
  cart:
    typeof window !== 'undefined' && localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart')!)
      : {
          cartItems: [],
          shippingAddress: {},
          paymentMethod: '',
          popUp: false
        }
};

export const Store = createContext<StoreContextInterface>({
  state: initialState,
  dispatch: () => null
});

function reducer(state: State, action: Action): State {
  if (typeof window === undefined) {
    return initialState;
  } else {
    switch (action.type) {
      case CartCommand.ADD: {
        const newItem = action.payload;
        const existItem = state.cart.cartItems.find(
          (item: OldCartItem) => item.id === newItem.id
        );

        const cartItems = existItem
          ? state.cart.cartItems.map(item =>
              item.id === existItem.id
                ? { ...newItem, quantity: newItem.quantity + item.quantity }
                : item
            )
          : [...state.cart.cartItems, newItem];

        localStorage.setItem(
          'cart',
          JSON.stringify({ ...state.cart, cartItems })
        );

        return { ...state, cart: { ...state.cart, cartItems } };
      }
      case CartCommand.UPDATE: {
        const updatedItem = action.payload;
        const existItem = state.cart.cartItems.find(
          (item: OldCartItem) => item.id === updatedItem.id
        );

        const cartItems = existItem
          ? state.cart.cartItems.map(item =>
              item.itemData?.name === existItem.itemData?.name
                ? { ...updatedItem, quantity: updatedItem.quantity }
                : item
            )
          : [...state.cart.cartItems, updatedItem];

        localStorage.setItem(
          'cart',
          JSON.stringify({ ...state.cart, cartItems })
        );

        return { ...state, cart: { ...state.cart, cartItems } };
      }
      case CartCommand.REMOVE: {
        const cartItems = state.cart.cartItems.filter(
          item => item.id !== action.payload.id
        );
        localStorage.setItem(
          'cart',
          JSON.stringify({ ...state.cart, cartItems })
        );

        return { ...state, cart: { ...state.cart, cartItems } };
      }
      case CartCommand.RESET: {
        return {
          ...state,
          cart: {
            cartItems: [],
            shippingAddress: {} as ShippingAddress,
            paymentMethod: '',
            popUp: false
          }
        };
      }
      case CartCommand.CLEAR: {
        localStorage.setItem(
          'cart',
          JSON.stringify({ ...state.cart, cartItems: [] as OldCartItem[] })
        );

        return {
          ...state,
          cart: {
            ...state.cart,
            cartItems: [] as OldCartItem[]
          }
        };
      }
      case CartCommand.SAVE_SHIPPING_ADDRESS: {
        return {
          ...state,
          cart: {
            ...state.cart,
            shippingAddress: {
              ...state.cart.shippingAddress,
              ...action.payload
            }
          }
        };
      }
      case CartCommand.SAVE_PAYMENT_METHOD: {
        return {
          ...state,
          cart: {
            ...state.cart,
            paymentMethod: action.payload
          }
        };
      }
      case CartCommand.POP_UP: {
        return {
          ...state,
          cart: {
            ...state.cart,
            popUp: action.payload
          }
        };
      }
      default:
        return state;
    }
  }
}

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Store.Provider value={value}>{children}</Store.Provider>;
};
