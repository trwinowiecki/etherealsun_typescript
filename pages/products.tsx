import Filter, { FilterChangeRequest } from '@ui/filter';
import Modal from '@ui/modal';
import PaginatedData from '@ui/paginated-data';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  CatalogObject,
  Client,
  Environment,
  SearchCatalogObjectsResponse
} from 'square';

import Breadcrumbs, { BreadcrumbPage } from '../components/bread-crumbs';
import Layout from '../components/layout';
import ProductCard from '../components/product-card';
import useSquareFilters from '../hooks/square-product-filter';
import useWindowBreakpoint, { WindowSize } from '../hooks/window-dimensions';

import { convertToJSON } from './api/square';

interface ProductsPageProps {
  catalog: SearchCatalogObjectsResponse;
}

const products = ({ catalog }: ProductsPageProps) => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { filters, filteredProducts, updateFilters } = useSquareFilters(
    catalog.objects ?? []
  );
  const paginatorLengthOpts = [12, 24, 48, 96];

  const windowSize = useWindowBreakpoint();

  useEffect(() => {
    const updateState = () => {
      const params = new URLSearchParams(router.asPath.split(/\?/)[1]);
      setPage(prev =>
        params.has('page') ? parseInt(params.get('page') as string, 10) : prev
      );

      const urlFilters = getFiltersFromParams(params);
      if (urlFilters && urlFilters.length > 0) {
        updateFilters(urlFilters);
      }
    };

    if (router.isReady) {
      updateState();
    }
  }, [router.isReady, router.asPath]);

  const getFiltersFromParams = (
    params: URLSearchParams
  ): FilterChangeRequest<string>[] => {
    return Array.from(params.keys()).map(key => ({
      key,
      value: params.get(key)
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(
      {
        pathname: '/products',
        query: {
          ...router.query,
          page: newPage.toString()
        }
      },
      undefined,
      { shallow: true, scroll: true }
    );
  };

  const handleProductClicked = (id: string) => {
    router.push(
      {
        pathname: '/products',
        query: {
          ...router.query,
          page
        },
        hash: id
      },
      undefined,
      { shallow: true }
    );
    router.push(`/product/${id}`);
  };

  const handleFilterChanged = (
    filterKeyValues: FilterChangeRequest<string>[]
  ) => {
    const newFilters: FilterChangeRequest<string>[] = filterKeyValues.filter(
      filter => filter.value !== null
    );

    router.push(
      {
        pathname: router.pathname,
        query: {
          page: router.query.page ? router.query.page : 1,
          ...newFilters.reduce(
            (acc, { key, value }) => ({ ...acc, [key]: value }),
            {}
          )
        }
      },
      undefined,
      { shallow: true, scroll: true }
    );
  };

  const breadcrumbs: BreadcrumbPage[] = [
    { href: '/', name: 'Home' },
    { href: '/products', name: 'Products', active: true }
  ];

  const renderProductCard = (product: CatalogObject): React.ReactNode => {
    return (
      <ProductCard
        key={product.id}
        item={product}
        relatedObj={catalog.relatedObjects}
        onClick={(id: string) => handleProductClicked(id)}
      />
    );
  };

  const renderFilter = () => {
    return <Filter filters={filters} filterRequest={handleFilterChanged} />;
  };

  return (
    <Layout title="Products">
      <section>
        {WindowSize[windowSize] >= WindowSize.md && (
          <Breadcrumbs pages={breadcrumbs} />
        )}
        <div className="relative flex flex-col items-center gap-2 md:flex-row md:items-start">
          <div className="sticky top-16 z-20 w-full bg-white shadow-md rounded-lg mb-4 md:w-[250px] md:max-w-[300px] md:max-h-[90vh]">
            {WindowSize[windowSize] >= WindowSize.md ? (
              <div className="p-4">
                <div className="mb-4">Filters</div>
                <div className="max-h-[80vh] overflow-y-auto">
                  {renderFilter()}
                </div>
              </div>
            ) : (
              <Modal name="Filters">{renderFilter()}</Modal>
            )}
          </div>
          <PaginatedData
            page={page}
            pageLengthOpts={paginatorLengthOpts}
            data={filteredProducts.filter(obj => obj.type === 'ITEM')}
            dataRenderer={renderProductCard}
            pageChanged={handlePageChange}
          />
        </div>
      </section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  const res = await client.catalogApi.searchCatalogObjects({
    includeRelatedObjects: true
  });

  const data = convertToJSON(res);

  if (!data.result) {
    return {
      notFound: true
    };
  }

  return {
    props: { catalog: data.result },
    revalidate: 60
  };
};

export default products;
