import { createContext, useReducer } from 'react';
import Cookies from 'js-cookie';
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
  | { type: 'CART_ADD_ITEM'; payload: CartItem }
  | { type: 'CART_REMOVE_ITEM'; payload: CartItem }
  | { type: 'CART_RESET' }
  | { type: 'CART_CLEAR_ITEMS'; payload: CartItem }
  | { type: 'SAVE_SHIPPING_ADDRESS'; payload: Cart['shippingAddress'] }
  | { type: 'SAVE_PAYMENT_METHOD'; payload: string };

const initialState: State = {
  cart: Cookies.get('cart')
    ? JSON.parse(Cookies.get('cart')!)
    : { cartItems: [] as CartItem[], shippingAddress: {}, paymentMethod: '' },
};

export const Store = createContext<StoreContextInterface>({
  state: initialState,
  dispatch: () => null,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CART_ADD_ITEM': {
      console.log(action.payload);
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find(
        (item: CartItem) => item.id === newItem.id
      );
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item.itemData?.name === existItem.itemData?.name ? newItem : item
          )
        : [...state.cart.cartItems, newItem];
      Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case 'CART_REMOVE_ITEM': {
      const cartItems = state.cart.cartItems.filter(
        (item) => item.id !== action.payload.id
      );
      Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case 'CART_RESET': {
      return {
        ...state,
        cart: {
          cartItems: [] as CartItem[],
          shippingAddress: {} as Cart['shippingAddress'],
          paymentMethod: '',
        },
      };
    }
    case 'CART_CLEAR_ITEMS': {
      Cookies.set(
        'cart',
        JSON.stringify({ ...state.cart, cartItems: [] as CartItem[] })
      );
      return {
        ...state,
        cart: {
          ...state.cart,
          cartItems: [] as CartItem[],
        },
      };
    }
    case 'SAVE_SHIPPING_ADDRESS': {
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: {
            ...state.cart.shippingAddress,
            ...action.payload,
          },
        },
      };
    }
    case 'SAVE_PAYMENT_METHOD': {
      return {
        ...state,
        cart: {
          ...state.cart,
          paymentMethod: action.payload,
        },
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
