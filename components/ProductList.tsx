import Filter, { FilterField } from '@ui/Filter';
import Modal from '@ui/Modal';
import axios from 'axios';
import { useEffect, useReducer, useState } from 'react';
import { CatalogObject, SearchCatalogObjectsResponse } from 'square';
import { SquareCommands } from '../enums/SquareCommands';
import { getError } from '../utils/error';
import useWindowBreakpoint, { windowSizes } from '../utils/windowDimensions';
import Loading from './Loading';
import ProductCard from './ProductCard';

type ReducerState = {
  loading: boolean;
  error?: string;
  catalog?: SearchCatalogObjectsResponse;
  filters?: CatalogObject[];
};
type ReducerAction =
  | { type: 'FETCH_REQUEST' }
  | { type: 'FETCH_FAIL'; payload: string }
  | {
      type: 'FETCH_SUCCESS';
      payload: SearchCatalogObjectsResponse;
    };

function reducer(state: ReducerState, action: ReducerAction): ReducerState {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
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
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

interface FilterState {}

export default function ProductList() {
  const [{ loading, error, catalog, filters }, catalogDispatch] = useReducer(
    reducer,
    {
      loading: true
    }
  );
  const [filter, setFilter] = useState({});

  const windowSize = useWindowBreakpoint();

  useEffect(() => {
    const controller = new AbortController();
    const fetchCatalog = async () => {
      try {
        catalogDispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios({
          method: 'POST',
          url: `/api/square`,
          data: { type: SquareCommands.GET_ALL_CATALOG },
          signal: controller.signal
        });
        catalogDispatch({
          type: 'FETCH_SUCCESS',
          payload: data
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          catalogDispatch({
            type: 'FETCH_FAIL',
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

  const handleFilter = (event: any, field: FilterField) => {
    setFilter(prev => ({ ...prev, [field.name]: { value: event } }));
  };

  const categoryField: FilterField = {
    name: 'Category',
    values:
      filters &&
      filters
        .filter(obj => obj.type === 'CATEGORY')
        .map(cat => cat.categoryData!.name!),
    selected: filter['Category']?.value,
    setSelected: (val, field) => handleFilter(val, field),
    type: 'radio'
  };

  const filterFields: FilterField[] = [
    {
      name: 'test',
      values: ['testone', 'test2'],
      selected: filter['test']?.value,
      setSelected: (val, field) => handleFilter(val, field),
      type: 'radio'
    },
    {
      name: 'test2',
      values: ['testone', 'test2'],
      description: 'TEst description',
      selected: filter['test2']?.value,
      setSelected: (val, field) => handleFilter(val, field),
      type: 'radio'
    },
    {
      name: 'test2',
      values: ['testone', 'test2'],
      description: 'TEst description',
      selected: filter['test2']?.value,
      setSelected: (val, field) => handleFilter(val, field),
      type: 'radio'
    },
    {
      name: 'test2',
      values: ['testone', 'test2'],
      description: 'TEst description',
      selected: filter['test2']?.value,
      setSelected: (val, field) => handleFilter(val, field),
      type: 'radio'
    },
    {
      name: 'test2',
      values: ['testone', 'test2'],
      description: 'TEst description',
      selected: filter['test2']?.value,
      setSelected: (val, field) => handleFilter(val, field),
      type: 'radio'
    },
    {
      name: 'test2',
      values: ['testone', 'test2'],
      description: 'TEst description',
      selected: filter['test2']?.value,
      setSelected: (val, field) => handleFilter(val, field),
      type: 'radio'
    },
    {
      name: 'test2',
      values: ['testone', 'test2'],
      description: 'TEst description',
      selected: filter['test2']?.value,
      setSelected: (val, field) => handleFilter(val, field),
      type: 'radio'
    },
    {
      name: 'test2',
      values: ['testone', 'test2'],
      description: 'TEst description',
      selected: filter['test2']?.value,
      setSelected: (val, field) => handleFilter(val, field),
      type: 'radio'
    },
    categoryField
  ];

  return (
    <>
      {loading ? (
        <Loading />
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="relative flex flex-col items-center md:flex-row md:items-start">
          <div className="sticky top-16 z-10 w-full bg-white shadow-md rounded-lg mb-4 md:w-[200px] md:max-w-[300px] md:max-h-[90vh]">
            {windowSizes[windowSize] >= windowSizes.md ? (
              <div className="p-4">
                <div className="mb-4">Filters</div>
                <div className="max-h-[80vh] overflow-y-auto">
                  <Filter fields={filterFields} />
                </div>
              </div>
            ) : (
              <Modal name="Filters">
                <Filter fields={filterFields} />
              </Modal>
            )}
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
