import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import CartItemComponent from '@ui/CartItemComponent';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { CartCommands } from '../enums/CartCommands';
import { Store } from '../utils/Store';

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
        enterFrom="translate-y-full"
        enterTo="translate-y-0"
        leave="transition transform duration-150"
        leaveFrom="translate-y-0"
        leaveTo="translate-y-full"
        className="absolute bottom-0 left-0 right-0 max-h-[50vh] rounded-t-lg p-4 overflow-y-hidden overflow-x-auto z-50 bg-primary-background "
      >
        <div>
          <XMarkIcon className="h-6 cursor-pointer" onClick={handleClose} />
          <Button intent={'primary'} onClick={() => handleRoute('/cart')}>
            Go to Cart
          </Button>
        </div>
        {cartItems.map(item => (
          <CartItemComponent key={item.id} item={item} />
        ))}
      </Transition>
    </>
  );
}

export default dynamic(() => Promise.resolve(CartPopup), { ssr: false });
