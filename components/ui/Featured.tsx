import { CatalogObject } from 'square';

import ProductCard from '../ProductCard';

interface FeaturedProps {
  name: string;
  products: CatalogObject[];
  relatedObjs: CatalogObject[];
}

const Featured = ({ name, products, relatedObjs }: FeaturedProps) => {
  return (
    <section className="p-4 bg-primary-background-darker">
      <h2 className="tracking-widest">{name.toUpperCase()}</h2>
      <div className="flex w-full max-w-full gap-4 pt-4 overflow-y-auto">
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
