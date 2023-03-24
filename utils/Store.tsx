import { createContext, useMemo, useReducer } from 'react';

import { CartCommand } from '../enums/CartCommands';
import { Cart, ShippingAddress } from '../types/Cart.model';
import { CartItem } from '../types/CartItem';

interface StoreContextInterface {
  state: State;
  dispatch: React.Dispatch<any>;
}

interface State {
  cart: Cart;
}

type Action =
  | { type: CartCommand.ADD; payload: CartItem }
  | { type: CartCommand.UPDATE; payload: CartItem }
  | { type: CartCommand.REMOVE; payload: CartItem }
  | { type: CartCommand.RESET }
  | { type: CartCommand.CLEAR; payload: CartItem }
  | {
      type: CartCommand.SAVE_SHIPPING_ADDRESS;
      payload: ShippingAddress;
    }
  | { type: CartCommand.SAVE_PAYMENT_METHOD; payload: string }
  | { type: CartCommand.POP_UP; payload: boolean };

const CART_KEY = 'cart';

const initialState: State = {
  cart:
    typeof window !== 'undefined' && sessionStorage.getItem(CART_KEY)
      ? JSON.parse(sessionStorage.getItem(CART_KEY)!)
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
          item => item.catalogObjectId === newItem.catalogObjectId
        );

        const cartItems = existItem
          ? state.cart.cartItems.map(item =>
              item.catalogObjectId === existItem.catalogObjectId
                ? CartItem.fromCartItem({
                    ...newItem,
                    quantity: newItem.quantity + item.quantity
                  } as CartItem)
                : item
            )
          : [...state.cart.cartItems, newItem];

        setCart({ ...state.cart, cartItems });

        return { ...state, cart: { ...state.cart, cartItems } };
      }
      case CartCommand.UPDATE: {
        const updatedItem = action.payload;
        const existItem = state.cart.cartItems.find(
          item => item.catalogObjectId === updatedItem.catalogObjectId
        );

        const cartItems = existItem
          ? state.cart.cartItems.map(item =>
              item.catalogObjectId === existItem.catalogObjectId
                ? CartItem.fromCartItem({
                    ...existItem,
                    ...updatedItem,
                    quantity: updatedItem.quantity
                  } as CartItem)
                : item
            )
          : [...state.cart.cartItems, updatedItem];

        setCart({ ...state.cart, cartItems });

        return { ...state, cart: { ...state.cart, cartItems } };
      }
      case CartCommand.REMOVE: {
        const cartItems = state.cart.cartItems.filter(
          item => item.catalogObjectId !== action.payload.catalogObjectId
        );

        setCart({ ...state.cart, cartItems });

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
        setCart({ ...state.cart, cartItems: [] });

        return {
          ...state,
          cart: {
            ...state.cart,
            cartItems: []
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

const setCart = (value: any) => {
  sessionStorage.setItem(CART_KEY, JSON.stringify(value));
};

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Store.Provider value={value}>{children}</Store.Provider>;
};
