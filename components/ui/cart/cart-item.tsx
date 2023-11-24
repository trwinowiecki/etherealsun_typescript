/* eslint-disable jsx-a11y/anchor-is-valid */
import Image from '@ui/image';
import Link from 'next/link';

import { CartCommand } from '../../../enums/cart-commands';
import { CartItem } from '../../../types/cart-item';
import { useStoreContext } from '../../../contexts/store';
import { cn } from '../../../utils/tw-utils';
import Quantity from '../quantity';

interface CartItemProps {
  item: CartItem;
  className?: string;
  children?: React.ReactNode;
}

function CartItemComponent({
  item,
  className = '',
  children = null
}: CartItemProps) {
  const { state, dispatch } = useStoreContext();
  const {
    cart: { cartItems }
  } = state;

  const handleQuantityUpdate = async (
    selectedItem: CartItem,
    quantity: number
  ) => {
    if (quantity <= 0) {
      dispatch({
        type: CartCommand.REMOVE,
        payload: selectedItem
      });
    } else {
      dispatch({
        type: CartCommand.UPDATE,
        payload: CartItem.fromCartItem({
          ...selectedItem,
          quantity
        } as CartItem)
      });
    }
  };

  return (
    <div
      key={item.catalogObjectId}
      className={cn(
        'flex justify-between items-center gap-2 p-2 px-4',
        className
      )}
    >
      <div
        key={item.catalogObjectId}
        className="flex items-center flex-1 gap-4"
      >
        <Link href={`/product/${item.catalogObjectId}`}>
          <a className="w-14 min-w-[3.5rem]">
            <Image
              src={item.images[0].url}
              alt={item.images[0].name || item.name}
            />
          </a>
        </Link>
        <div className="flex flex-col gap-1">
          <Link href={`/product/${item.catalogObjectId}`}>
            <a>
              <span>{item.name}</span>
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
      <span className="">${(item.price * item.quantity) / 100}</span>
    </div>
  );
}

export default CartItemComponent;
