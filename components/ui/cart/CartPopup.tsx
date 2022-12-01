import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import CartItemComponent from '@ui/cart/CartItemComponent';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { CartCommands } from '../../../enums/CartCommands';
import { Store } from '../../../utils/Store';
import Subtotal from './Subtotal';

interface Props {}

function CartPopup() {
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems, popUp }
  } = state;
  const router = useRouter();

  const handleRoute = (route: string) => {
    router.push(route);
    handleClose();
  };

  const handleClose = () => {
    dispatch({
      type: CartCommands.POP_UP,
      payload: false
    });
  };

  useEffect(() => {
    if (popUp) {
      router.events.on('routeChangeComplete', handleClose);
    }
  }, [popUp]);

  return (
    <>
      <Transition
        show={popUp}
        enter="transition duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-25"
        leave="transition duration-150"
        leaveFrom="opacity-25"
        leaveTo="opacity-0"
        className="absolute top-0 bottom-0 left-0 right-0 z-40 bg-black"
        onClick={handleClose}
      />
      <Transition
        show={popUp}
        enter="transition transform duration-75"
        enterFrom="translate-y-full md:translate-x-full md:translate-y-0"
        enterTo="translate-y-0 md:translate-x-0"
        leave="transition transform duration-150"
        leaveFrom="translate-y-0 md:translate-x-0"
        leaveTo="translate-y-full md:translate-x-full md:translate-y-0"
        className="absolute bottom-0 left-0 right-0 z-50 max-h-[50vh] p-4 rounded-t-lg md:rounded-l-lg md:left-auto md:h-screen md:max-h-screen md:top-0 bg-primary-background md:rounded-tr-none"
      >
        <div className="flex items-center justify-between">
          <XMarkIcon className="h-6 cursor-pointer" onClick={handleClose} />
          <Button intent={'primary'} onClick={() => handleRoute('/cart')}>
            Go to Cart
          </Button>
        </div>
        <div className="flex gap-2 px-2 py-4 overflow-x-auto md:flex-col md:gap-0 md:rounded-md md:bg-primary-background-darker md:my-4 md:shadow-md md:overflow-y-auto md:max-h-[80%] md:w-[30vw]">
          {cartItems.map(item => (
            <div className="rounded-md shadow-lg md:rounded-none min-w-fit bg-primary-background-darker md:shadow-none">
              <CartItemComponent key={item.id} item={item} />
            </div>
          ))}
        </div>
        <div>
          <Subtotal cartItems={cartItems} />
        </div>
      </Transition>
    </>
  );
}

export default dynamic(() => Promise.resolve(CartPopup), { ssr: false });
