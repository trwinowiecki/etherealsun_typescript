import { createContext, useReducer } from 'react';
import { CartCommands } from '../enums/CartCommands';
import { Cart, ShippingAddress } from '../types/Cart.model';
import { CartItem } from '../types/CartItem';

interface StoreContextInterface {
  state: State;
  dispatch: React.Dispatch<any>;
}

type State = {
  cart: Cart;
};

type Action =
  | { type: CartCommands.ADD; payload: CartItem }
  | { type: CartCommands.UPDATE; payload: CartItem }
  | { type: CartCommands.REMOVE; payload: CartItem }
  | { type: CartCommands.RESET }
  | { type: CartCommands.CLEAR; payload: CartItem }
  | {
      type: CartCommands.SAVE_SHIPPING_ADDRESS;
      payload: ShippingAddress;
    }
  | { type: CartCommands.SAVE_PAYMENT_METHOD; payload: string }
  | { type: CartCommands.POP_UP; payload: boolean };

const initialState: State = {
  cart:
    typeof window !== 'undefined'
      ? localStorage.getItem('cart')
        ? JSON.parse(localStorage.getItem('cart')!)
        : {
            cartItems: [],
            shippingAddress: {},
            paymentMethod: '',
            popUp: false
          }
      : { cartItems: [], shippingAddress: {}, paymentMethod: '', popUp: false }
};

export const Store = createContext<StoreContextInterface>({
  state: initialState,
  dispatch: () => null
});

function reducer(state: State, action: Action): State {
  if (typeof window !== undefined) {
    switch (action.type) {
      case CartCommands.ADD: {
        const newItem = action.payload;
        const existItem = state.cart.cartItems.find(
          (item: CartItem) => item.id === newItem.id
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
      case CartCommands.UPDATE: {
        const updatedItem = action.payload;
        const existItem = state.cart.cartItems.find(
          (item: CartItem) => item.id === updatedItem.id
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
      case CartCommands.REMOVE: {
        const cartItems = state.cart.cartItems.filter(
          item => item.id !== action.payload.id
        );
        localStorage.setItem(
          'cart',
          JSON.stringify({ ...state.cart, cartItems })
        );

        return { ...state, cart: { ...state.cart, cartItems } };
      }
      case CartCommands.RESET: {
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
      case CartCommands.CLEAR: {
        localStorage.setItem(
          'cart',
          JSON.stringify({ ...state.cart, cartItems: [] as CartItem[] })
        );

        return {
          ...state,
          cart: {
            ...state.cart,
            cartItems: [] as CartItem[]
          }
        };
      }
      case CartCommands.SAVE_SHIPPING_ADDRESS: {
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
      case CartCommands.SAVE_PAYMENT_METHOD: {
        return {
          ...state,
          cart: {
            ...state.cart,
            paymentMethod: action.payload
          }
        };
      }
      case CartCommands.POP_UP: {
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
  } else {
    return initialState;
  }
}

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{children}</Store.Provider>;
};
