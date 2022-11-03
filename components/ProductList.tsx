import axios from 'axios';
import { useEffect, useReducer } from 'react';
import { SearchCatalogObjectsResponse } from 'square';
import { SquareCommands } from '../enums/SquareCommands';
import { getError } from '../utils/error';
import Loading from './Loading';
import ProductCard from './ProductCard';

enum ReducerActions {
  FETCH_REQUEST = 'FETCH_REQUEST',
  FETCH_SUCCESS = 'FETCH_SUCCESS',
  FETCH_FAIL = 'FETCH_FAIL'
}
type ReducerState = {
  loading: boolean;
  error?: string;
  catalog?: SearchCatalogObjectsResponse;
};
type ReducerAction =
  | { type: ReducerActions.FETCH_REQUEST }
  | { type: ReducerActions.FETCH_FAIL; payload: string }
  | {
      type: ReducerActions.FETCH_SUCCESS;
      payload: SearchCatalogObjectsResponse;
    };

function reducer(state: ReducerState, action: ReducerAction): ReducerState {
  switch (action.type) {
    case ReducerActions.FETCH_REQUEST:
      return { ...state, loading: true, error: '' };
    case ReducerActions.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        catalog: action.payload,
        error: ''
      };
    case ReducerActions.FETCH_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function ProductList() {
  const [{ loading, error, catalog }, catalogDispatch] = useReducer(reducer, {
    loading: true
  });
  useEffect(() => {
    const controller = new AbortController();
    const fetchCatalog = async () => {
      try {
        catalogDispatch({ type: ReducerActions.FETCH_REQUEST });
        const { data } = await axios({
          method: 'POST',
          url: `/api/square`,
          data: { type: SquareCommands.GET_ALL_CATALOG },
          signal: controller.signal
        });
        catalogDispatch({
          type: ReducerActions.FETCH_SUCCESS,
          payload: data
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          catalogDispatch({
            type: ReducerActions.FETCH_FAIL,
            payload: getError(error)
          });
        }
      }
    };
    if (typeof window !== 'undefined') {
      fetchCatalog();
    }

    return () => {
      controller.abort('Process aborted');
    };
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <div className="w-full flex flex-wrap gap-4 justify-center">
          {catalog?.objects ? (
            catalog.objects.map(catalogObj => {
              if (catalogObj.type === 'ITEM') {
                return (
                  <ProductCard
                    key={catalogObj.id}
                    item={catalogObj}
                    relatedObj={catalog.relatedObjects}
                  />
                );
              }
            })
          ) : (
            <div>No Items Found</div>
          )}
        </div>
      )}
    </>
  );
}
