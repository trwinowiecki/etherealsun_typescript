import { CatalogObject } from 'square';

import ProductCard from '../ProductCard';

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
        className={`${
          products.length === 1 ? 'justify-center' : ''
        } flex w-full max-w-full gap-4 pt-4 overflow-y-auto`}
      >
        {products.map(product => (
          <ProductCard
            key={product.id}
            item={product}
            relatedObj={relatedObjs}
            hasFavButton={hasFavButton}
            hasCartButton={hasCartButton}
          />
        ))}
      </div>
    </>
  );
};

export default Featured;
