import Filter, { FilterField } from '@ui/Filter';
import Modal from '@ui/Modal';
import axios from 'axios';
import { GetStaticProps } from 'next';
import { useEffect, useReducer, useState } from 'react';
import {
  CatalogCategory,
  CatalogObject,
  SearchCatalogObjectsResponse
} from 'square';
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
  filters?: CatalogObject[];
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
      console.log(
        action.payload.relatedObjects?.filter(obj => obj.type === 'CATEGORY')
      );
      return {
        ...state,
        loading: false,
        catalog: action.payload,
        filters: action.payload.relatedObjects?.filter(
          obj => obj.type === 'CATEGORY'
        ),
        error: ''
      };
    case ReducerActions.FETCH_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function ProductList() {
  const [{ loading, error, catalog, filters }, catalogDispatch] = useReducer(
    reducer,
    {
      loading: true
    }
  );
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

  console.log('catalog', catalog);

  const [test, setTest] = useState('');
  const [category, setCategory] = useState('');

  const categoryField: FilterField = {
    name: 'Category',
    values:
      filters &&
      filters
        .filter(obj => obj.type === 'CATEGORY')
        .map(cat => cat.categoryData!.name!),
    selected: category,
    setSelected: cat => setCategory(cat),
    type: 'radio'
  };

  const filterFields: FilterField[] = [
    {
      name: 'test',
      values: ['testone', 'test2'],
      selected: test,
      setSelected: val => setTest(val),
      type: 'radio'
    },
    {
      name: 'test',
      values: ['testone', 'test2'],
      description: 'TEst description',
      selected: test,
      setSelected: val => setTest(val),
      type: 'radio'
    },
    {
      name: 'Category',
      values:
        filters &&
        filters
          .filter(obj => obj.type === 'CATEGORY')
          .map(cat => cat.categoryData!.name!),
      selected: category,
      setSelected: cat => setCategory(cat),
      type: 'radio'
    }
  ];

  return (
    <>
      {loading ? (
        <Loading />
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-full bg-background-primary shadow-md rounded-lg mb-4">
            <Modal name="Filters">
              <Filter fields={filterFields} />
            </Modal>
          </div>
          <div className="w-full flex flex-wrap gap-6 justify-center">
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
        </div>
      )}
    </>
  );
}
