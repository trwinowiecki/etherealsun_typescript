import Filter, { FilterField } from '@ui/Filter';
import Modal from '@ui/Modal';
import Paginator from '@ui/Paginator';
import { GetStaticProps } from 'next';
import { useState } from 'react';
import { Client, Environment, SearchCatalogObjectsResponse } from 'square';
import Breadcrumbs, { BreadcrumbPage } from '../components/Breadcrumbs';
import Layout from '../components/Layout';
import ProductList from '../components/ProductList';
import useWindowBreakpoint, { windowSizes } from '../utils/windowDimensions';
import { convertToJSON } from './api/square';

interface ProductsPageProps {
  catalog: SearchCatalogObjectsResponse;
  numItems: number;
}

const products = ({ catalog, numItems }: ProductsPageProps) => {
  const [filter, setFilter] = useState({});
  const [page, setPage] = useState(1);

  const windowSize = useWindowBreakpoint();

  const handleFilter = (event: any, field: FilterField) => {
    setFilter(prev => ({ ...prev, [field.name]: { value: event } }));
  };

  const filters = catalog.relatedObjects?.filter(
    obj => obj.type === 'CATEGORY'
  );
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

  const breadcrumbs: BreadcrumbPage[] = [
    { href: '/', name: 'Home' },
    { href: '/products', name: 'Products', active: true }
  ];

  return (
    <Layout title="Products">
      {windowSizes[windowSize] >= windowSizes.md && (
        <Breadcrumbs pages={breadcrumbs} />
      )}
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
        <div className="w-full flex flex-col gap-6 items-center">
          <ProductList
            catalog={catalog.objects}
            relatedObjs={catalog.relatedObjects}
          />
          <Paginator
            limits={[10, 25, 50, 100]}
            currentPage={page}
            numItems={
              catalog.objects?.filter(obj => obj.type === 'ITEM').length
            }
            onClick={val => setPage(prev => prev + val)}
          />
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN_PROD,
    environment: Environment.Production
  });

  const res = await client.catalogApi.searchCatalogObjects({
    includeRelatedObjects: true
  });

  const data: SearchCatalogObjectsResponse = convertToJSON(res);

  if (!data) {
    return {
      notFound: true
    };
  }

  const numItems = data.objects?.filter(obj => obj.type === 'ITEM').length;

  return {
    props: { catalog: data, numItems },
    revalidate: 60
  };
};

export default products;
