import { XMarkIcon } from '@heroicons/react/24/outline';
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
    <div
      className={`${
        popUp ? 'sticky' : 'hidden'
      } left-0 bottom-0 right-0 max-h-[50vh] rounded-t-md p-4 overflow-y-hidden overflow-x-auto z-50 bg-slate-500`}
    >
      <div className="cursor-pointer" onClick={handleClose}>
        <XMarkIcon className="h-6" />
      </div>
      {popUp ? 'true' : 'false'}
    </div>
  );
}

export default dynamic(() => Promise.resolve(CartPopup), { ssr: false });
