import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { CatalogObject } from 'square';

import { cn } from '../../utils/tw-utils';
import ProductCard from '../product-card';
import Button from './button';

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    updateScroll();
  }, [products]);

  const updateScroll = () => {
    if (featureGroupRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = featureGroupRef.current;
      const canScroll = scrollWidth > clientWidth;
      setCanScrollLeft(canScroll && scrollLeft > 0);
      setCanScrollRight(canScroll && scrollLeft + clientWidth < scrollWidth);
    }
  };

  const scrollLeft = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.scrollLeft -=
        featureGroupRef.current.scrollWidth / products.length;
    }
  };

  const scrollRight = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.scrollLeft +=
        featureGroupRef.current.scrollWidth / products.length;
    }
  };

  return (
    <>
      <div className="relative">
        <h2 className="tracking-widest">{name.toUpperCase()}</h2>
        <div
          ref={featureGroupRef}
          onScroll={() => updateScroll()}
          className={cn(
            'flex w-full max-w-full gap-4 pt-4 overflow-y-auto snap-mandatory',
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
              className="scroll-snap-align-start"
            />
          ))}
        </div>
        <Button
          className={cn(
            'absolute top-1/2 left-0 transform -translate-y-1/2 z-99',
            {
              invisible: !canScrollLeft
            }
          )}
          iconButton
          onClick={scrollLeft}
        >
          <ChevronLeftIcon className="w-8 h-8 text-white" />
        </Button>
        <Button
          className={cn(
            'absolute top-1/2 right-0 transform -translate-y-1/2 z-99',
            {
              invisible: !canScrollRight
            }
          )}
          iconButton
          onClick={scrollRight}
        >
          <ChevronRightIcon className="w-8 h-8 text-white" />
        </Button>
      </div>
    </>
  );
};

export default Featured;
