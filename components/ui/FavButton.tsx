import HeartIcon from '@heroicons/react/24/outline/HeartIcon';

interface FavButtonProps {
  isFavorite: boolean;
}

const FavButton = ({ isFavorite }: FavButtonProps) => {
  return (
    <>
      <HeartIcon
        className={`w-6 h-6 ${isFavorite ? 'fill-negative' : 'text-gray-500'}`}
      />
    </>
  );
};

export default FavButton;
