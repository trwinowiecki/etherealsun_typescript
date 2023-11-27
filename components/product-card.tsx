import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import FavButton from '@ui/favorite-button';
import Image from '@ui/image';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  ApiResponse,
  CatalogObject,
  Client,
  Environment,
  RetrieveCatalogObjectResponse,
  RetrieveInventoryCountResponse,
  SearchCatalogObjectsResponse
} from 'square';

import { convertToJSON } from '../pages/api/square';
import { Database } from '../types/supabase-data';
import { getImages } from '../utils/square-utils';
import { useStoreContext } from '../contexts/store';
import { handleError } from '../utils/supabase-utils';

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
  const { dispatch } = useStoreContext();
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
  }, [user?.id]);

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

export const getStaticPaths: GetStaticPaths = async () => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  const res = await client.catalogApi.searchCatalogObjects({
    includeRelatedObjects: true
  });

  const data = convertToJSON(res);

  const paths = data.result.objects?.map(obj => ({ params: { id: obj.id } }));

  return {
    paths: paths || [],
    fallback: true
  };
};

export const getStaticProps: GetStaticProps = async ctx => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  let res: ApiResponse<
    RetrieveCatalogObjectResponse & RetrieveInventoryCountResponse
  >;
  try {
    const catalogRes = await client.catalogApi.retrieveCatalogObject(
      ctx.params!.id! as string,
      true
    );
    const inventory = await client.inventoryApi.retrieveInventoryCount(
      convertToJSON(catalogRes).result.object?.itemData?.variations![0].id || ''
    );
    res = {
      ...catalogRes,
      result: {
        ...catalogRes.result,
        ...inventory.result,
        errors: [
          ...(catalogRes.result.errors || []),
          ...(inventory.result.errors || [])
        ]
      }
    };
  } catch (error) {
    res = { result: error, statusCode: 500 } as unknown as ApiResponse<any>;
  }

  const data = convertToJSON(res);

  return {
    props: { item: data.result.object, relatedObj: data.result.relatedObjects }
  };
};

export default ProductCard;