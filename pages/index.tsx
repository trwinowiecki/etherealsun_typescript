import Featured from '@ui/Featured';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { Client, Environment, SearchCatalogObjectsResponse } from 'square';

import Layout from '../components/Layout';

import { convertToJSON } from './api/square';

interface HomeProps {
  catalog: SearchCatalogObjectsResponse;
}

const Home = ({ catalog }: HomeProps) => {
  const catIds = catalog?.objects
    ?.filter(obj => obj.type === 'CATEGORY')
    .map(obj => obj.id);

  const mockFeatured = catalog?.objects?.filter(
    obj => obj.type === 'ITEM' && obj.itemData?.categoryId === catIds![2]
  );

  const mockFeatured2 = catalog?.objects?.filter(
    obj => obj.type === 'ITEM' && obj.itemData?.categoryId === catIds![3]
  );

  return (
    <Layout overridePadding>
      <div className="wrapper">
        <section className="p-4">
          <Link href="/products">products page</Link>
        </section>
        <section className="p-4 rounded bg-primary-background-darker">
          <Featured
            name="Necklaces"
            products={mockFeatured ?? []}
            relatedObjs={catalog.relatedObjects ?? []}
          />
        </section>
        <section className="p-4 mt-4 rounded bg-primary-background-darker">
          <Featured
            name="Accessories"
            products={mockFeatured2 ?? []}
            relatedObjs={catalog.relatedObjects ?? []}
          />
        </section>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ctx => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN_PROD,
    environment: Environment.Production
  });

  const res = await client.catalogApi.searchCatalogObjects({
    includeRelatedObjects: true
  });

  const data: SearchCatalogObjectsResponse = convertToJSON(res);

  return {
    props: { catalog: data },
    revalidate: 60
  };
};

export default Home;
