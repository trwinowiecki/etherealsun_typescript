import Image from '@ui/Image';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import {
  CatalogObject,
  Client,
  Environment,
  RetrieveCatalogObjectResponse,
  SearchCatalogObjectsResponse
} from 'square';
import { convertToJSON } from '../pages/api/square';
import { getImages } from '../utils/squareUtils';

interface ProductCardProps {
  item: CatalogObject;
  relatedObj: SearchCatalogObjectsResponse['relatedObjects'];
}

function ProductCard({ item, relatedObj }: ProductCardProps) {
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
    <div className="overflow-hidden w-full md:w-[200px] max-w-[250px] min-w-[200px] drop-shadow-md rounded-t-full rounded-b-lg hover:cursor-pointer hover:drop-shadow-lg hover:scale-105  hover:-translate-y-2 transition-all ease-in-out duration-300 hover:z-10">
      <Link href={`/product/${item.id}`}>
        <a className="text-primary-text hover:text-primary-text">
          <Image
            alt={item.itemData?.name!}
            src={itemImages[0].imageData?.url!}
          />
          <div className="p-2 text-center">
            <div className="font-semibold">{item.itemData?.name}</div>
            <div>
              {prices.length > 1
                ? `$${Math.min(...prices)} - $${Math.max(...prices)}`
                : `$${prices[0]}`}
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async ctx => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN_PROD,
    environment: Environment.Production
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
    accessToken: process.env.SQUARE_ACCESS_TOKEN_PROD,
    environment: Environment.Production
  });

  let res;
  try {
    res = await client.catalogApi.retrieveCatalogObject(ctx.params!.id!, true);
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
