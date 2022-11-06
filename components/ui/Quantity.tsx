import React from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface ButtonProps {
  quantity: number;
  adjustQuantity: (q: number) => void;
  maxQuantity: number;
}

const Quantity = ({ quantity, adjustQuantity }: ButtonProps) => {
  const handleQuantityUpdate = (val) => {
    adjustQuantity(val);
  };

  return (
    <div className='flex gap-2 items-center'>
      <MinusIcon onClick={() => handleQuantityUpdate(-1)} />
      <div>{quantity}</div>
      <PlusIcon onClick={() => handleQuantityUpdate(1)} />
    </div>
  );
};

export default Quantity;
