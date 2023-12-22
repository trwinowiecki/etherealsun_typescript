import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/tw-utils';
import Button from './button';
import FadeInOut from './fade-in-out';

type GalleryProps = {
  children: React.ReactNode;
  length: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  direction?: 'horizontal' | 'vertical';
  iconClass?: string;
};

const Gallery = ({
  children,
  length,
  scrollRef,
  direction = 'horizontal',
  iconClass = ''
}: GalleryProps) => {
  const [canScrollReverse, setCanScrollReverse] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.onscroll = () => updateScroll();
      updateScroll();
    }
  }, [
    scrollRef.current?.scrollLeft,
    scrollRef.current?.scrollTop,
    scrollRef.current?.scrollHeight,
    scrollRef.current?.scrollWidth,
    scrollRef.current?.clientHeight,
    scrollRef.current?.clientWidth
  ]);

  const updateScroll = () => {
    if (direction === 'horizontal') {
      updateHorizontalScroll();
    } else {
      updateVerticalScroll();
    }
  };

  const updateHorizontalScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const canScroll = scrollWidth > clientWidth;
      setCanScrollReverse(canScroll && scrollLeft > 0);
      setCanScrollForward(canScroll && scrollLeft + clientWidth < scrollWidth);
    }
  };

  const updateVerticalScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const canScroll = scrollHeight > clientHeight;
      setCanScrollReverse(canScroll && scrollTop > 0);
      setCanScrollForward(canScroll && scrollTop + clientHeight < scrollHeight);
    }
  };

  const scrollReverse = () => {
    if (scrollRef.current) {
      if (direction === 'horizontal') {
        scrollRef.current.scrollLeft -= scrollRef.current.scrollWidth / length;
      } else {
        scrollRef.current.scrollTop -= scrollRef.current.scrollHeight / length;
      }
    }
  };

  const scrollForward = () => {
    if (scrollRef.current) {
      if (direction === 'horizontal') {
        scrollRef.current.scrollLeft += scrollRef.current.scrollWidth / length;
      } else {
        scrollRef.current.scrollTop += scrollRef.current.scrollHeight / length;
      }
    }
  };

  return (
    <div className="relative">
      <FadeInOut isShowing={canScrollReverse} durationClass="duration-[150ms]">
        <Button
          className={cn(
            'absolute transform z-50',
            {
              'rotate-90 top-0 left-1/2 -translate-x-1/2':
                direction === 'vertical'
            },
            { 'top-1/2 left-0 -translate-y-1/2': direction === 'horizontal' }
          )}
          iconButton
          onClick={scrollReverse}
        >
          <ChevronLeftIcon className={cn('w-8 h-8 text-white', iconClass)} />
        </Button>
      </FadeInOut>
      <FadeInOut isShowing={canScrollForward} durationClass="duration-[150ms]">
        <Button
          className={cn(
            'absolute transform z-50',
            {
              'rotate-90 bottom-0 left-1/2 -translate-x-1/2':
                direction === 'vertical'
            },
            { 'top-1/2 right-0 -translate-y-1/2': direction === 'horizontal' }
          )}
          iconButton
          onClick={scrollForward}
        >
          <ChevronRightIcon className={cn('w-8 h-8 text-white', iconClass)} />
        </Button>
      </FadeInOut>
      {children}
    </div>
  );
};

export default Gallery;
