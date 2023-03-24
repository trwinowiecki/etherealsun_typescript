/* eslint-disable jsx-a11y/anchor-is-valid */
import Image from '@ui/Image';
import Link from 'next/link';
import { useContext } from 'react';

import { CartCommand } from '../../../enums/CartCommands';
import { CartItem } from '../../../types/CartItem';
import { Store } from '../../../utils/Store';
import Quantity from '../Quantity';

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
      className={`flex justify-between items-center gap-2 p-2 px-4 ${classes}`}
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
