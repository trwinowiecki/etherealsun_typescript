import axios from 'axios';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import { CatalogObject, RetrieveCatalogObjectResponse } from 'square';
import Layout from '../../components/Layout';
import { SquareCommands } from '../../enums/SquareCommands';

interface ProductPageProps {
  catalogObjects: RetrieveCatalogObjectResponse;
}

function ProductPage(props: ProductPageProps) {
  const { catalogObjects } = props;
  const router = useRouter();

  if (catalogObjects.errors) {
    return (
      <Layout title={catalogObjects.errors[0].code}>
        {catalogObjects.errors[0].detail}
      </Layout>
    );
  }

  return (
    <Layout title={catalogObjects.object?.itemData?.name}>
      {catalogObjects.object?.itemData?.name}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;

  const { data } = await axios({
    method: 'POST',
    url: `${process.env.BASE_URL}/api/square`,
    data: { type: SquareCommands.GET_ONE_CATALOG, id: id },
  });

  return {
    props: {
      catalogObjects: data,
    },
  };
};

export default ProductPage;
