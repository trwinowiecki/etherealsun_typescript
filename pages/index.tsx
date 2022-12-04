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

const Home: NextPage = ({ catalog }: HomeProps) => {
  const catIds = catalog.objects.reduce([acc, obj] => {
    if (obj.type === 'CATEGORY') {
      acc.push(obj.id);
    }
  }, []);
  console.log('🚀 ~ file: index.tsx ~ line 21 ~ catIds ~ catIds', catIds);

  const mockFeatured = catalog?.objects.filter(
    obj => obj.type === 'ITEM' && obj.itemData?.categoryId === catIds[1]
  );
  console.log('🚀 ~ file: index.tsx ~ line 25 ~ mockFeatured', mockFeatured);

  return (
    <Layout>
      <div className="wrapper">
        <Link href="/products">products page</Link>
        <Featured
          name="Necklaces"
          products={mockFeatured}
          relatedObjs={catalog.relatedObjects}
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
