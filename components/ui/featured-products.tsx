import { CatalogObject } from 'square';

import { cn } from '../../utils/tw-utils';
import ProductCard from '../product-card';

interface FeaturedProps {
  name: string;
  products: CatalogObject[];
  relatedObjs: CatalogObject[];
  hasFavButton?: boolean;
  hasCartButton?: boolean;
}

const Featured = ({
  name,
  products,
  relatedObjs,
  hasFavButton = false,
  hasCartButton = false
}: FeaturedProps) => {
  return (
    <>
      <h2 className="tracking-widest">{name.toUpperCase()}</h2>
      <div
        className={cn('flex w-full max-w-full gap-4 pt-4 overflow-y-auto', {
          'justify-center': products.length === 1
        })}
      >
        {products.map(product => (
          <ProductCard
            key={product.id}
            item={product}
            relatedObj={relatedObjs}
            hasFavButton={hasFavButton}
          />
        ))}
      </div>
    </>
  );
};

export default Featured;
