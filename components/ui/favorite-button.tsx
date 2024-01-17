/* eslint-disable @typescript-eslint/naming-convention */
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { toast } from 'react-toastify';

import { Database } from '../../types/supabase-data';
import { cn } from '../../utils/tw-utils';

interface FavButtonProps {
  isFavorite: boolean;
  productId: string;
  handleFavorite: (newValue: boolean) => void;
}

const FavButton = ({
  isFavorite,
  productId,
  handleFavorite
}: FavButtonProps) => {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();

  const handleClick = (newValue: boolean) => {
    if (newValue) {
      if (!user) {
        toast.error('Please login to favorite products');
        return;
      }
      supabase
        .from('favorite_products')
        .insert([{ product_id: productId, user_id: user!.id }])
        .then(
          () => handleFavorite(newValue),
          () =>
            toast.error(
              'Sorry, could not favorite this product. Please try again'
            )
        );
    } else {
      supabase
        .from('favorite_products')
        .delete()
        .eq('product_id', productId)
        .then(
          () => handleFavorite(newValue),
          () =>
            toast.error(
              'Sorry, could not unfavorite this product. Please try again'
            )
        );
    }
  };

  return (
    <button
      onClick={() => handleClick(!isFavorite)}
      type="button"
      aria-label="Favorite"
    >
      <HeartIcon
        className={cn(
          'w-8 h-8 text-primary-text hover:stroke-[3px] fill-white',
          { 'fill-negative': isFavorite }
        )}
      />
    </button>
  );
};

export default FavButton;
