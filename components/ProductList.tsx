import { CatalogObject } from 'square';
import ProductCard from './ProductCard';

interface ProductListProps {
  catalog?: CatalogObject[];
  relatedObjs?: CatalogObject[];
}

export default function ProductList({
  catalog,
  relatedObjs
}: ProductListProps) {
  return catalog ? (
    <>
      {catalog.map(catalogObj => {
        if (catalogObj.type === 'ITEM') {
          return (
            <ProductCard
              key={catalogObj.id}
              item={catalogObj}
              relatedObj={relatedObjs}
            />
          );
        }
      })}
    </>
  ) : (
    <div>No Items Found</div>
  );
}
