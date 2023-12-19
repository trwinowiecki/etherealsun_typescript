import React, { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { cn } from '../../utils/tw-utils';

export type FadeInOutProps = {
  children: React.ReactNode;
  isShowing: boolean;
  fadeIn?: boolean;
  fadeOut?: boolean;
  durationClass?: string;
};

const FadeInOut = ({
  children,
  isShowing: showing,
  fadeIn = true,
  fadeOut = true,
  durationClass = 'duration-[300ms]'
}: FadeInOutProps) => {
  return (
    <Transition
      as="div"
      show={showing}
      enter={cn('transition', durationClass)}
      enterFrom={fadeIn ? 'opacity-0' : 'opacity-100'}
      enterTo="opacity-100"
      leave={cn('transition', durationClass)}
      leaveFrom="opacity-100"
      leaveTo={fadeOut ? 'opacity-0' : 'opacity-100'}
    >
      {children}
    </Transition>
  );
};

export default FadeInOut;
