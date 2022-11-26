import Image from '@ui/Image';
import Link from 'next/link';
import { useContext } from 'react';
import { CartCommands } from '../../enums/CartCommands';
import { CartItem } from '../../types/CartItem';
import { getImages } from '../../utils/squareUtils';
import { Store } from '../../utils/Store';
import Quantity from './Quantity';

interface CartItemProps {
  item: CartItem;
  classes?: string;
  children?: React.ReactNode;
}

function CartItemComponent({
  item,
  classes = '',
  children = null
}: CartItemProps) {
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems }
  } = state;

  const handleQuantityUpdate = async (
    selectedItem: CartItem,
    quantity: number
  ) => {
    if (quantity <= 0) {
      dispatch({
        type: CartCommands.REMOVE,
        payload: selectedItem
      });
    } else {
      dispatch({
        type: CartCommands.UPDATE,
        payload: {
          ...selectedItem,
          quantity,
          relatedObjects: selectedItem.relatedObjects
        }
      });
    }
  };

  return (
    <div
      key={item.id}
      className={`flex justify-between items-center gap-2 p-2 px-4 ${classes}`}
    >
      <div key={item.id} className="flex items-center gap-4 flex-1">
        <Link href={`/product/${item.id}`}>
          <a className="w-14 min-w-[3.5rem]">
            <Image
              src={getImages(item, item.relatedObjects)[0].imageData?.url!}
              alt={item.itemData?.name!}
            />
          </a>
        </Link>
        <div className="flex flex-col gap-1">
          <Link href={`/product/${item.id}`}>
            <a>
              <span>{item.itemData?.name}</span>
            </a>
          </Link>
          <Quantity
            quantity={item.quantity}
            adjustQuantity={newQuantity =>
              handleQuantityUpdate(item, newQuantity)
            }
            maxQuantity={5}
            allowDelete
          />
        </div>
      </div>
      {children}
      <span className="">
        $
        {Number(
          item.itemData?.variations![0].itemVariationData?.priceMoney?.amount
        ) / 100}
      </span>
    </div>
  );
}

export default CartItemComponent;
