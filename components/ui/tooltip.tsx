import { Transition } from '@headlessui/react';
import { useEffect, useRef, useState } from 'react';

type TooltipProps = {
  text: string;
  children: React.ReactNode;
};

const Tooltip = (props: TooltipProps) => {
  const [isShowing, setIsShowing] = useState(false);

  const startHover = () => {
    setIsShowing(true);
  };

  const endHover = () => {
    setTimeout(() => setIsShowing(false), 300);
  };

  function useOutsideAlerter(ref: any) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          alert('You clicked outside of me!');
        }
      }
      // Bind the event listener
      if (isShowing) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref]);
  }

  const ref = useRef(null);
  useOutsideAlerter(ref);

  return (
    <div
      className="relative inline-block leading-none h-max cursor-help group w-max"
      onMouseEnter={() => setIsShowing(true)}
      onMouseLeave={endHover}
      onClick={() => setIsShowing(true)}
      ref={ref}
    >
      {props.children}
      <Transition
        show={isShowing}
        enter="transition duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <span
          id="tooltip"
          className="z-50 font-normal text-sm absolute left-[50%] bottom-[50%] w-max max-w-[50vw] bg-primary-background shadow-md p-2"
        >
          {props.text}
        </span>
      </Transition>
    </div>
  );
};

export default Tooltip;
