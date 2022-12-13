import { CatalogObject } from 'square';

import ProductCard from '../ProductCard';

interface FeaturedProps {
  name: string;
  products: CatalogObject[];
  relatedObjs: CatalogObject[];
}

const Featured = ({ name, products, relatedObjs }: FeaturedProps) => {
  return (
    <section className="">
      <h2>{name.toUpperCase()}</h2>
      <div className="flex w-full gap-2 overflow-y-auto">
        {products.map(product => (
          <div key={product.id}>
            <ProductCard item={product} relatedObj={relatedObjs} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Featured;
