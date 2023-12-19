import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { CatalogObject } from 'square';

import { cn } from '../../utils/tw-utils';
import ProductCard from '../product-card';
import Button from './button';
import FadeInOut from './fade-in-out';

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
        <FadeInOut isShowing={canScrollLeft} durationClass="duration-[150ms]">
          <Button
            className="absolute top-1/2 left-0 transform -translate-y-1/2 z-50"
            iconButton
            onClick={scrollLeft}
          >
            <ChevronLeftIcon className="w-8 h-8 text-white" />
          </Button>
        </FadeInOut>
        <FadeInOut isShowing={canScrollRight} durationClass="duration-[150ms]">
          <Button
            className="absolute top-1/2 right-0 transform -translate-y-1/2 z-50"
            iconButton
            onClick={scrollRight}
          >
            <ChevronRightIcon className="w-8 h-8 text-white" />
          </Button>
        </FadeInOut>
        <h2 className="tracking-widest">{name.toUpperCase()}</h2>
        <div
          ref={featureGroupRef}
          onScroll={() => updateScroll()}
          className={cn(
            'flex w-full max-w-full gap-4 pt-4 overflow-y-auto motion-safe:scroll-smooth',
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
      </div>
    </>
  );
};

export default Featured;
