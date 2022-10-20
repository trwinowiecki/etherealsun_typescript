import axios from 'axios';
import { NextPage } from 'next';
import Image from 'next/image';
import { useContext, useEffect, useReducer } from 'react';
import { BatchRetrieveCatalogObjectsResponse, CatalogObject } from 'square';
import Layout from '../components/Layout';
import { SquareCommands } from '../enums/SquareCommands';
import { getError } from '../utils/error';
import { getImages } from '../utils/images';
import { Store } from '../utils/Store';

interface Props {}

enum ReducerActions {
  FETCH_REQUEST = 'FETCH_REQUEST',
  FETCH_SUCCESS = 'FETCH_SUCCESS',
  FETCH_FAIL = 'FETCH_FAIL'
}
interface ReducerState extends BatchRetrieveCatalogObjectsResponse {
  loading: boolean;
  axiosError?: string;
}
type ReducerAction =
  | { type: ReducerActions.FETCH_REQUEST }
  | { type: ReducerActions.FETCH_FAIL; payload: string }
  | {
      type: ReducerActions.FETCH_SUCCESS;
      payload: ReducerState;
    };

function reducer(state: ReducerState, action: ReducerAction): ReducerState {
  switch (action.type) {
    case ReducerActions.FETCH_REQUEST:
      return { ...state, loading: true, errors: [] };
    case ReducerActions.FETCH_SUCCESS:
      return {
        ...state,
        ...action.payload,
        loading: false
      };
    case ReducerActions.FETCH_FAIL:
      return { ...state, axiosError: action.payload, loading: false };
    default:
      return state;
  }
}

const Cart: NextPage<Props> = ({}) => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [
    { loading, axiosError, errors, objects, relatedObjects },
    catalogDispatch
  ] = useReducer(reducer, {
    loading: true
  });

  console.log(cart);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        catalogDispatch({ type: ReducerActions.FETCH_REQUEST });
        console.log(
          '🚀 ~ file: cart.tsx ~ line 68 ~ fetchCartItems ~ cart.cartItems.map(item => item.id)',
          cart.cartItems.map(item => item.id)
        );
        const itemIds = cart.cartItems.map(item => item.id);
        const { data } = await axios({
          method: 'POST',
          url: `/api/square`,
          data: {
            type: SquareCommands.GET_BATCH_CATALOG,
            body: itemIds
          }
        });
        console.log(
          '🚀 ~ file: cart.tsx ~ line 71 ~ fetchCartItems ~ data',
          data
        );
        catalogDispatch({
          type: ReducerActions.FETCH_SUCCESS,
          payload: data
        });
      } catch (error) {
        catalogDispatch({
          type: ReducerActions.FETCH_FAIL,
          payload: getError(error)
        });
      }
    };
    fetchCartItems();
  }, [cart.cartItems]);

  const emptyCart = <Layout title="Cart"> test</Layout>;

  let itemImages: { id: string; images: CatalogObject[] }[];

  if (objects) {
    objects.forEach(item => {
      console.log(item);
      itemImages = [
        ...itemImages,
        { id: item.id, images: getImages(item, relatedObjects!) }
      ];
    });
    console.log(itemImages);
  }

  return (
    <Layout title="Cart">
      <>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            <h1>Cart</h1>
            {cart.cartItems && cart.cartItems.length > 0 ? (
              <div className="w-full flex flex-col">
                {cart.cartItems.map(item => {
                  return (
                    <div key={item.id}>
                      <Image
                        width={10}
                        height={10}
                        objectFit="cover"
                        src={itemImages[item.id][0].imageData?.url!}
                        alt={item.itemData?.name}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>No cart items found</div>
            )}
          </div>
        )}
      </>
    </Layout>
  );
};

export default Cart;
