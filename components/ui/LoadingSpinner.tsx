import { Transition } from '@headlessui/react';
import { SunIcon } from '@heroicons/react/24/outline';

export interface LoadingSpinnerProps {
  loading: boolean;
}

const LoadingSpinner = ({ loading }: LoadingSpinnerProps) => {
  return (
    <Transition
      show={loading}
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="absolute inset-0 z-50 flex items-center justify-center w-full h-full bg-white bg-opacity-75 overflow-hidden">
        <SunIcon className="animate-spin-slow text-primary max-w-sm" />
      </div>
    </Transition>
  );
};

export default LoadingSpinner;
