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
}
type ReducerAction =
  | { type: ReducerActions.FETCH_REQUEST }
  | { type: ReducerActions.FETCH_FAIL; payload: ReducerState }
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
      return { ...state, ...action.payload, loading: false };
    default:
      return state;
  }
}

const Cart: NextPage<Props> = ({}) => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [{ loading, errors, objects, relatedObjects }, catalogDispatch] =
    useReducer(reducer, {
      loading: true
    });

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        catalogDispatch({ type: ReducerActions.FETCH_REQUEST });
        const { data } = await axios({
          method: 'POST',
          url: `/api/square`,
          data: {
            type: SquareCommands.GET_BATCH_CATALOG,
            body: cart.cartItems.map(item => item.id)
          }
        });
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
    fetchCatalog();
  }, [cart.cartItems]);

  let itemImages: { [id: string]: CatalogObject[] };
  objects?.forEach(item => {
    itemImages[item.id] = getImages(item, relatedObjects!);
  });

  return (
    <Layout title="Cart">
      <>
        <h1>Cart</h1>
        {cart.cartItems ? (
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
      </>
    </Layout>
  );
};

export default Cart;
