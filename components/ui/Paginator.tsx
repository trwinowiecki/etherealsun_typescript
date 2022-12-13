import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

import CustomListbox from '../CustomListbox';

interface PaginatorProps {
  pageLengthOpts: number[];
  selectedLength: number;
  currentPage: number;
  numItems: number;
  onPageChange: (val: number) => void;
  onLengthChange: (val: number) => void;
  firstLastPageVisible?: boolean;
}

const Paginator = ({
  pageLengthOpts,
  selectedLength,
  currentPage,
  numItems,
  onPageChange,
  onLengthChange,
  firstLastPageVisible = true
}: PaginatorProps) => {
  const maxPage = Math.ceil(numItems / selectedLength);

  const handlePageChange = (val: number) => {
    if (val < 1 || val > maxPage) {
      return;
    }
    onPageChange(val);
  };

  const handleLimitChange = (val: number) => {
    const newMaxPage = Math.ceil(numItems / val);
    if (currentPage > newMaxPage) {
      onPageChange(1);
    }
    onLengthChange(val);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <div className="flex items-center gap-2">
        {firstLastPageVisible ? (
          <ChevronDoubleLeftIcon
            className="h-5 cursor-pointer"
            onClick={() => handlePageChange(1)}
            aria-label="first page"
          />
        ) : null}
        <ChevronLeftIcon
          className="h-5 cursor-pointer"
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="previous page"
        />
        <div className="w-16 text-center">{`${currentPage} of ${maxPage}`}</div>
        <ChevronRightIcon
          className="h-5 cursor-pointer"
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="next page"
        />
        {firstLastPageVisible ? (
          <ChevronDoubleRightIcon
            className="h-5 cursor-pointer"
            onClick={() => handlePageChange(maxPage)}
            aria-label="last page"
          />
        ) : null}
      </div>
      <CustomListbox
        listOfItems={pageLengthOpts}
        state={selectedLength}
        setState={val => handleLimitChange(val)}
        label="products per page"
        aria-label="page length options"
      />
    </div>
  );
};

export default Paginator;
