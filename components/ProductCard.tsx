import Image from '@ui/Image';
import Link from 'next/link';
import { CatalogObject, SearchCatalogObjectsResponse } from 'square';
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

export default ProductCard;
