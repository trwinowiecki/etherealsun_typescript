import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { CatalogObject } from 'square';

import { cn } from '../../utils/tw-utils';
import ProductCard from '../product-card';
import Button from './button';
import FadeInOut from './fade-in-out';
import Gallery from './gallery';

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
  const featureGroupRef = useRef<HTMLDivElement>(null);

  return (
    <Gallery length={products.length} scrollRef={featureGroupRef}>
      <h2 className="tracking-widest">{name.toUpperCase()}</h2>
      <div
        ref={featureGroupRef}
        className={cn(
          'flex w-full max-w-full gap-4 pt-4 overflow-x-scroll motion-safe:scroll-smooth',
          {
            'justify-center': products.length === 1
          }
        )}
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
    </Gallery>
  );
};

export default Featured;
