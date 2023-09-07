import { createContext, useContext, useReducer } from 'react';

import { SupabaseClient, User } from '@supabase/auth-helpers-react';
import axios, { AxiosResponse } from 'axios';
import { RetrieveCustomerResponse } from 'square';
import { CartCommand } from '../enums/CartCommands';
import { SquareCommand } from '../enums/SquareCommands';
import { Cart, ShippingAddress } from '../types/Cart.model';
import { CartItem } from '../types/CartItem';
import { UserSupaFull } from '../types/Supabase';
import { Database } from '../types/SupabaseDbTypes';

interface StoreContextInterface {
  state: State;
  dispatch: React.Dispatch<any>;
}

interface State {
  cart: Cart;
  user: UserSupaFull;
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
  | { type: CartCommand.POP_UP; payload: boolean }
  | {
      type: CartCommand.SET_USER;
      payload: { user: User | null; supabaseClient: SupabaseClient<Database> };
    };

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
        },
  user: {} as UserSupaFull
};

export const Store = createContext<StoreContextInterface>({
  state: initialState,
  dispatch: () => null
});

export const useStoreContext = () => {
  const context = useContext(Store);

  if (context === undefined) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }

  return context;
};

function reducer(state: State, action: Action): State {
  console.log('action', action);
  console.log('state', state);
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
      case CartCommand.SET_USER: {
        if (action.payload === null) {
          return { ...state, user: {} as UserSupaFull };
        }
        getUser(action.payload.user, action.payload.supabaseClient).then(
          user => ({
            ...state,
            user: user
          })
        );
      }
      default:
        return state;
    }
  }
}

async function getUser(
  user: User,
  supabase: SupabaseClient
): Promise<UserSupaFull> {
  let userProfile: UserSupaFull = user as UserSupaFull;

  const res = await supabase.from('profiles').select().eq('id', user.id);

  if (res && res.data && res.data[0]) {
    userProfile = { ...res.data[0], ...userProfile };
  }

  if (userProfile.square_id) {
    const data: AxiosResponse<RetrieveCustomerResponse> = await axios.request({
      method: 'POST',
      url: 'api/square',
      data: {
        type: SquareCommand.GET_CUSTOMER,
        id: userProfile.square_id
      }
    });

    if (data && data.data) {
      userProfile = {
        ...userProfile,
        square_customer: data.data.customer || {}
      };
    }
  }

  console.log('userProfile', userProfile);

  return userProfile;
}

const setCart = (value: any) => {
  sessionStorage.setItem(CART_KEY, JSON.stringify(value));
};

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = { state, dispatch };
  return <Store.Provider value={value}>{children}</Store.Provider>;
};
