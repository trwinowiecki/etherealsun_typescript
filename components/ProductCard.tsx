import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import FavButton from '@ui/FavButton';
import Image from '@ui/Image';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import {
  CatalogObject,
  Client,
  Environment,
  RetrieveCatalogObjectResponse,
  SearchCatalogObjectsResponse
} from 'square';

import { convertToJSON } from '../pages/api/square';
import { Database } from '../types/SupabaseDbTypes';
import { getImages } from '../utils/squareUtils';
import { Store } from '../utils/Store';
import { handleError } from '../utils/supabaseUtils';

interface ProductCardProps {
  item: CatalogObject;
  relatedObj: SearchCatalogObjectsResponse['relatedObjects'];
  onClick?: (id: string) => void;
  hasFavButton?: boolean;
}

function ProductCard({
  item,
  relatedObj,
  onClick,
  hasFavButton = false
}: ProductCardProps) {
  const router = useRouter();
  const { dispatch } = useContext(Store);
  const user = useUser();
  const supabase = useSupabaseClient<Database>();
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const getFavorites = async (abortSignal: AbortSignal) => {
      const res = await supabase
        .from('favorite_products')
        .select()
        .eq('product_id', item.id)
        .abortSignal(abortSignal)
        .maybeSingle();

      if (res.error) {
        handleError(res.error);
        return;
      }

      if (res.data?.product_id === item.id) {
        setFavorite(true);
      }
    };

    const controller = new AbortController();
    if (user?.id && hasFavButton) {
      getFavorites(controller.signal);
    }

    return () => controller.abort('Cancelled by user');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleClick =
    onClick ??
    ((id: string) => {
      router.push(`/product/${id}`);
    });

  const itemImages = getImages(item, relatedObj!);

  const prices = Array.from(
    new Set(
      item.itemData?.variations?.map(
        variation =>
          (variation?.itemVariationData?.priceMoney
            ?.amount as unknown as number) / 100
      )
    )
  );

  return (
    <div
      id={item.id}
      className="relative overflow-hidden w-full md:w-[200px] max-w-[250px] min-w-[200px] drop-shadow-md hover:cursor-pointer hover:drop-shadow-lg hover:scale-105 hover:-translate-y-2 transition-all ease-in-out duration-300 hover:z-10 snap-start scroll-mt-32 justify-between flex flex-col"
    >
      <button
        className="w-full cursor-pointer text-primary-text hover:text-primary-text"
        type="button"
        onClick={() => handleClick(item.id)}
      >
        <Image
          alt={item.itemData?.name ?? 'Default'}
          src={itemImages[0].imageData?.url ?? '/defaultProduct.png'}
          className="overflow-hidden rounded-t-full rounded-b-lg"
        />
        <div className="p-2 text-center">
          <div className="font-semibold">{item.itemData?.name}</div>
          <>
            {prices.length > 1
              ? `$${Math.min(...prices)} - $${Math.max(...prices)}`
              : `$${prices[0]}`}
          </>
        </div>
      </button>
      {hasFavButton && (
        <div className="absolute top-[7%] right-[7%] md:top-[5%] md:right-[5%]">
          <FavButton
            isFavorite={favorite}
            productId={item.id}
            handleFavorite={newValue => setFavorite(newValue)}
          />
        </div>
      )}
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async ctx => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  const res = await client.catalogApi.searchCatalogObjects({
    includeRelatedObjects: true
  });

  const data: SearchCatalogObjectsResponse = convertToJSON(res);

  const paths = data.objects!.map(obj => ({ params: { id: obj.id } }));

  return {
    paths,
    fallback: true
  };
};

export const getStaticProps: GetStaticProps = async ctx => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  let res;
  try {
    res = await client.catalogApi.retrieveCatalogObject(
      ctx.params!.id! as string,
      true
    );
    res = {
      ...res,
      inventory: await client.inventoryApi.retrieveInventoryCount(
        convertToJSON(res).object.itemData.variations[0].id
      )
    };
  } catch (error) {
    res = error;
  }

  const data: RetrieveCatalogObjectResponse = convertToJSON(res);

  return {
    props: { item: data.object, relatedObj: data.relatedObjects }
  };
};

export default ProductCard;
