import Image from '@ui/Image';
import axios from 'axios';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import {
  CatalogObject,
  RetrieveCatalogObjectResponse,
  SearchCatalogObjectsResponse
} from 'square';
import { SquareCommands } from '../enums/SquareCommands';
import { getImages } from '../utils/images';

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
    <div className="overflow-hidden w-full max-w-[250px] drop-shadow-md rounded-t-full rounded-b-lg hover:cursor-pointer hover:drop-shadow-lg hover:scale-105  hover:-translate-y-2 transition-all ease-in-out duration-300 hover:z-10">
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
  const { data }: { data: SearchCatalogObjectsResponse } = await axios({
    method: 'POST',
    url: `/api/square`,
    data: { type: SquareCommands.GET_ALL_CATALOG }
  });

  const paths = data.objects!.map(obj => ({ params: { id: obj.id } }));

  return {
    paths,
    fallback: true
  };
};

export const getStaticProps: GetStaticProps = async ctx => {
  const { data }: { data: RetrieveCatalogObjectResponse } = await axios({
    method: 'POST',
    url: `/api/square`,
    data: { type: SquareCommands.GET_ONE_CATALOG, id: ctx.params!.id }
  });

  console.log(ctx);

  return {
    props: { item: data.object, relatedObj: data.relatedObjects }
  };
};

export default ProductCard;
