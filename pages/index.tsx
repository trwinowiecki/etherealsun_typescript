import { createClient } from '@supabase/supabase-js';
import Featured from '@ui/Featured';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import {
  BatchRetrieveCatalogObjectsResponse,
  CatalogObject,
  Client,
  Environment
} from 'square';
import axios from 'axios';

import Layout from '../components/Layout';
import { FeaturedProduct } from '../types/FeaturedProduct';
import { Database } from '../types/SupabaseDbTypes';
import { ShippoCommand } from '../enums/ShippoCommands';

import { convertToJSON } from './api/square';
import { ShippoAddressRequest } from './api/shippo';

interface HomeProps {
  featuredProducts: FeaturedProduct[];
  relatedObjects: CatalogObject[] | undefined;
}

const Home = ({ featuredProducts, relatedObjects }: HomeProps) => {
  const shippoButton = async () => {
    const validateAddressReq: ShippoAddressRequest = {
      type: ShippoCommand.VALIDATE_ADDRESS,
      data: {
        name: 'John Smith',
        street1: '6512 Greene Rd.',
        city: 'Woodridge',
        state: 'IL',
        zip: '60517',
        country: 'US'
      }
    };
    await axios({
      method: 'GET',
      url: `api/shippo`,
      data: validateAddressReq
    }).then(({ data }) => {
      console.log(data);
    });
  };
  return (
    <Layout overridePadding>
      <button onClick={shippoButton}>Shippo</button>
      <div className="flex flex-col gap-4">
        <section className="p-4">
          <Link href="/products">products page</Link>
        </section>
        {featuredProducts?.map(group =>
          group.products.length > 0 ? (
            <section
              key={group.id}
              className="p-4 rounded bg-primary-background-darker"
            >
              <Featured
                name={group.title}
                products={group.products}
                relatedObjs={relatedObjects ?? []}
                hasFavButton
              />
            </section>
          ) : null
        )}
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const date = new Date();
  const { data: groupData } = await supabase
    .from('featured_groups')
    .select()
    .gt('end_date', date.toUTCString())
    .lte('start_date', date.toUTCString());

  if (!groupData || groupData.length === 0) {
    return {
      props: {},
      revalidate: 1
    };
  }

  const { data: productData } = await supabase
    .from('featured_products')
    .select()
    .in(
      'group_id',
      groupData.map(group => group.id)
    );

  if (!productData || productData.length === 0) {
    return {
      props: {},
      revalidate: 1
    };
  }

  const squareClient = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  const res = await squareClient.catalogApi.batchRetrieveCatalogObjects({
    objectIds: productData.map(product => product.id),
    includeRelatedObjects: true
  });

  const squareData: BatchRetrieveCatalogObjectsResponse = convertToJSON(res);

  if (!squareData.objects) {
    return {
      props: {},
      revalidate: 1
    };
  }

  const featuredProducts: FeaturedProduct[] = groupData.map(group => {
    const productIds = productData
      .filter(product => product.group_id === group.id)
      .map(product => product.id);
    return {
      id: group.id,
      title: group.title!,
      startDate: group.start_date!,
      endDate: group.start_date!,
      products: squareData.objects!.filter(obj => productIds.includes(obj.id))
    };
  });

  return {
    props: {
      featuredProducts: featuredProducts.sort((g1, g2) =>
        Date.parse(g1.startDate) < Date.parse(g2.startDate) ? 1 : -1
      ),
      relatedObjects: squareData.relatedObjects
    },
    revalidate: 100
  };
};

export default Home;
