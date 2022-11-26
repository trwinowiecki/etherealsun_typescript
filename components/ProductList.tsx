import { CatalogObject } from 'square';
import ProductCard from './ProductCard';

interface ProductListProps {
  catalog?: CatalogObject[];
  relatedObjs?: CatalogObject[];
  onClick?: (id: string) => void;
}

export default function ProductList({
  catalog,
  relatedObjs,
  onClick
}: ProductListProps) {
  if (!onClick)
    return catalog ? (
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
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
      </div>
    ) : (
      <div>No Items Found</div>
    );
}
