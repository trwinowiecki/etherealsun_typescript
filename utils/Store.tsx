import Cookies from 'js-cookie';
import { createContext, useReducer } from 'react';
import { CartCommands } from '../enums/CartCommands';
import { Cart } from '../types/Cart';
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
  | { type: CartCommands.REMOVE; payload: CartItem }
  | { type: CartCommands.RESET }
  | { type: CartCommands.CLEAR; payload: CartItem }
  | {
      type: CartCommands.SAVE_SHIPPING_ADDRESS;
      payload: Cart['shippingAddress'];
    }
  | { type: CartCommands.SAVE_PAYMENT_METHOD; payload: string };

const initialState: State = {
  cart: Cookies.get('cart')
    ? JSON.parse(Cookies.get('cart')!)
    : { cartItems: [] as CartItem[], shippingAddress: {}, paymentMethod: '' }
};

export const Store = createContext<StoreContextInterface>({
  state: initialState,
  dispatch: () => null
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case CartCommands.ADD: {
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find(
        (item: CartItem) => item.id === newItem.id
      );

      const cartItems = existItem
        ? state.cart.cartItems.map(item =>
            item.itemData?.name === existItem.itemData?.name
              ? { ...newItem, quantity: newItem.quantity + item.quantity }
              : item
          )
        : [...state.cart.cartItems, newItem];

      Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));

      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case CartCommands.REMOVE: {
      const cartItems = state.cart.cartItems.filter(
        item => item.id !== action.payload.id
      );
      Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));

      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case CartCommands.RESET: {
      return {
        ...state,
        cart: {
          cartItems: [] as CartItem[],
          shippingAddress: {} as Cart['shippingAddress'],
          paymentMethod: ''
        }
      };
    }
    case CartCommands.CLEAR: {
      Cookies.set(
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
    default:
      return state;
  }
}

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{children}</Store.Provider>;
};
