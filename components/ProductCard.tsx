import { maxHeaderSize } from 'http';
import Image from 'next/image';
import Link from 'next/link';
import React, { PropsWithoutRef } from 'react';
import {
  CatalogObject,
  CatalogObjectBatch,
  SearchCatalogObjectsResponse,
} from 'square';

interface ProductCardProps {
  item: CatalogObject;
  relatedObj: SearchCatalogObjectsResponse['relatedObjects'];
}

function ProductCard({ item, relatedObj }: ProductCardProps) {
  const imageIds = item.itemData?.imageIds;
  const itemImages = relatedObj?.filter(
    (obj) => obj.type === 'IMAGE' && imageIds?.includes(obj.id)
  );
  const prices = Array.from(
    new Set(
      item.itemData?.variations?.map(
        (variation) =>
          (variation?.itemVariationData?.priceMoney
            ?.amount as unknown as number) / 100
      )
    )
  );
  return (
    <div className="w-full max-w-xs sm:w-1/3 md:w-1/3 lg:w-1/4 shadow-lg rounded-lg cursor-pointer">
      <Link href={`/product/${item.id}`}>
        <a>
          <Image
            alt={item.itemData?.name}
            src={itemImages?.length > 0 ? itemImages[0].imageData?.url! : '/'}
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
