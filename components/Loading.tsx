import { SunIcon } from '@heroicons/react/24/outline';

interface Props {}

function Loading() {
  return (
    <div className="absolute top-12 left-0 right-0 bottom-0 flex flex-col justify-around items-center h- bg-black bg-opacity-50 overflow-hidden">
      <SunIcon className="animate-spin-slow text-primary" />
    </div>
  );
}

export default Loading;
