import Image from 'next/image';
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
    <div className="overflow-hidden w-full max-w-xs sm:w-1/3 md:w-1/3 lg:w-1/4 drop-shadow-lg rounded-t-full rounded-lg hover:cursor-pointer hover:drop-shadow-2xl hover:scale-105 border-primary-background-darker border-8 bg-primary-background-darker hover:-translate-y-2 transition-all ease-in-out duration-300">
      <Link href={`/product/${item.id}`}>
        <a>
          <Image
            alt={item.itemData?.name}
            src={itemImages[0].imageData?.url!}
            width={1}
            height={1}
            layout="responsive"
            objectFit="cover"
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
