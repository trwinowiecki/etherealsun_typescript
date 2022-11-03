import { XMarkIcon } from '@heroicons/react/24/outline';
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

  const handleClose = () => {
    dispatch({
      type: CartCommands.POP_UP,
      payload: false
    });
  };

  return (
    <>
      <div
        className={`${
          popUp ? 'absolute' : 'hidden'
        } top-0 bottom-0 left-0 right-0 bg-black bg-opacity-25 z-50`}
        onClick={handleClose}
      />
      <div
        className={`${
          popUp ? 'sticky bottom-0' : 'hidden '
        } left-0 right-0 max-h-[50vh] rounded-t-lg p-4 overflow-y-hidden overflow-x-auto z-50 bg-primary-background transition-all`}
      >
        <div className="cursor-pointer" onClick={handleClose}>
          <XMarkIcon className="h-6" />
        </div>
        {cartItems.map(item => (
          <CartItemComponent key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(CartPopup), { ssr: false });
