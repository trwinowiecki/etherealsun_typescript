import { w } from '@supabase/auth-helpers-nextjs/dist/withMiddlewareAuth-9d46fbd7';
import Filter, { FilterField } from '@ui/filter';
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
import useWindowBreakpoint, { WindowSize } from '../hooks/window-dimensions';

import { convertToJSON } from './api/square';

interface ProductsPageProps {
  catalog: SearchCatalogObjectsResponse;
}

const products = ({ catalog }: ProductsPageProps) => {
  const products: CatalogObject[] =
    catalog.objects?.filter(obj => obj.type === 'ITEM') ?? [];
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState(products ?? []);
  const paginatorLengthOpts = [12, 24, 48, 96];

  const windowSize = useWindowBreakpoint();

  useEffect(() => {
    const updateState = () => {
      setPage(prev =>
        router.query.page ? parseInt(router.query.page as string, 10) : prev
      );
    };

    if (router.isReady) {
      updateState();
    }
  }, [router.isReady]);

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

  const handleFilterChange = (products: CatalogObject[]) => {
    setFilteredProducts(products.filter(obj => obj.type === 'ITEM'));
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
                  <Filter
                    products={catalog.objects ?? []}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
            ) : (
              <Modal name="Filters">
                <Filter
                  products={catalog.objects ?? []}
                  onFilterChange={handleFilterChange}
                />
              </Modal>
            )}
          </div>
          <PaginatedData
            page={page}
            pageLengthOpts={paginatorLengthOpts}
            data={filteredProducts}
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
