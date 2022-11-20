import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface PaginatorProps {
  limits: number[];
  currentPage: number;
  numItems: number;
  onClick: (val: number) => void;
}

const Paginator = ({
  limits,
  currentPage,
  numItems,
  onClick
}: PaginatorProps) => {
  const [limit, setLimit] = useState(limits[0]);
  const maxPage = Math.ceil(numItems / limit);

  const handleClick = (val: number) => {
    if (val + currentPage < 1 || val + currentPage > maxPage) {
      return;
    }
    onClick(val);
  };

  return (
    <div className="flex items-center gap-2">
      <ChevronLeftIcon
        className="h-5 cursor-pointer"
        onClick={() => handleClick(-1)}
      />
      <div className="w-16 text-center">{`${currentPage} of ${maxPage}`}</div>
      <ChevronRightIcon
        className="h-5 cursor-pointer"
        onClick={() => handleClick(1)}
      />
      <button onClick={() => setLimit(limits[1])}>Change Limit</button>
    </div>
  );
};

export default Paginator;
