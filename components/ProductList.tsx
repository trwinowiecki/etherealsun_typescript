import { useRouter } from 'next/router';
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
  const router = useRouter();
  const handleClick = onClick
    ? onClick
    : (id: string) => {
        router.push(`/product/${id}`);
      };

  return catalog ? (
    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
      {catalog.map(catalogObj => {
        if (catalogObj.type === 'ITEM') {
          return (
            <ProductCard
              key={catalogObj.id}
              item={catalogObj}
              relatedObj={relatedObjs}
              onClick={(id: string) => handleClick(id)}
            />
          );
        }
      })}
    </div>
  ) : (
    <div>No Items Found</div>
  );
}
