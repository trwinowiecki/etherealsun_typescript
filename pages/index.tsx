import Featured from '@ui/Featured';
import type { NextPage } from 'next';
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
    obj => obj.type === 'ITEM' && obj.itemData?.categoryId === catIds![0]
  );

  return (
    <Layout overridePadding>
      <div className="wrapper">
        <section className="p-4">
          <Link href="/products">products page</Link>
        </section>
        <Featured
          name="Necklaces"
          products={mockFeatured ?? []}
          relatedObjs={catalog.relatedObjects ?? []}
        />
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
