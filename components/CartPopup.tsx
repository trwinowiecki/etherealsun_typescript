import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../utils/Store';

interface Props {}

function CartPopup() {
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems }
  } = state;
  const router = useRouter();

  const [showing, setShowing] = useState(false);

  useEffect(() => {
    console.log(showing);
    if (router.pathname.includes('/cart') || showing) {
      setShowing(false);
    } else {
      setShowing(true);
    }
    console.log(showing);
  }, [cartItems]);

  const handleClose = () => {
    setShowing(false);
  };

  return (
    <div
      className={`${
        showing ? 'bottom-0' : 'top-full'
      } absolute left-0 bottom-0 right-0 h-[50vh] overflow-y-hidden overflow-x-auto bg-slate-500`}
      onClick={() => handleClose}
    >
      {JSON.stringify(cartItems)}
    </div>
  );
}

export default dynamic(() => Promise.resolve(CartPopup), { ssr: false });
