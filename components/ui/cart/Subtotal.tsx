import { CartItem } from '../../../types/CartItem';

interface SubtotalProps {
  cartItems: CartItem[];
}

const Subtotal = ({ cartItems }: SubtotalProps) => {
  const subtotal = calcSubtotal(cartItems);

  return (
    <div className="w-full p-4 rounded-md shadow-md bg-primary-background-darker">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Subtotal</h1>
        <p>${subtotal}</p>
      </div>
      <div className="text-xs">Taxes and shipping calculated at checkout</div>
    </div>
  );
};

export const calcSubtotal = (cartItems: CartItem[]) => {
  return cartItems.reduce(
    (acc, item) => acc + (item.price * item.quantity) / 100,
    0
  );
};

export default Subtotal;
