import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface ButtonProps {
  quantity: number;
  maxQuantity: number;
  adjustQuantity: (q: number) => void;
  allowDelete?: boolean;
}

const Quantity = ({
  quantity,
  adjustQuantity,
  maxQuantity,
  allowDelete = false
}: ButtonProps) => {
  const handleQuantityUpdate = (val: number) => {
    if (val + quantity < 1) {
      return;
    }
    if (val + quantity > maxQuantity) {
      toast.error('Sorry, not enough items in stock 😥');
      adjustQuantity(maxQuantity);
      return;
    }
    adjustQuantity(val + quantity);
  };

  const handleDelete = () => {
    adjustQuantity(-1);
  };

  return (
    <div className="flex items-center">
      {allowDelete ? (
        <TrashIcon
          className="h-5 cursor-pointer text-negative mr-2"
          onClick={handleDelete}
        />
      ) : null}
      <MinusIcon
        className="h-5 cursor-pointer"
        onClick={() => handleQuantityUpdate(-1)}
      />
      <div className="min-w-[2rem] text-center">{quantity}</div>
      <PlusIcon
        className="h-5 cursor-pointer"
        onClick={() => handleQuantityUpdate(1)}
      />
    </div>
  );
};

export default Quantity;
