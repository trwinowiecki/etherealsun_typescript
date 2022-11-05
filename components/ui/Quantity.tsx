import React from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface ButtonProps {
  quantity: number;
  adjustQuantity: (q: number) => void;
}

const Quantity = ({ quantity, adjustQuantity }: ButtonProps) => {
  const handleQuantityUpdate = (val) => {
    adjustQuantity(val);
  };

  return (
    <div>
      <MinusIcon onClick={() => handleQuantityUpdate(-1)} />
      <div>{quantity}</div>
      <PlusIcon onClick={() => handleQuantityUpdate(1)} />
    </div>
  );
};

export default Quantity;
