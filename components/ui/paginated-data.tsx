import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import DropdownMenu from './dropdown-menu';

type PaginatedDataProps<T> = {
  data: T[];
  dataRenderer: (data: T) => React.ReactNode;
  firstLastPageVisible?: boolean;
  pageLengthOpts?: number[];
  page: number;
  pageChanged: (page: number) => void;
};

const PaginatedData = <T extends unknown>({
  data,
  dataRenderer,
  firstLastPageVisible = true,
  pageLengthOpts = [10, 25, 50],
  page,
  pageChanged
}: PaginatedDataProps<T>) => {
  const [pageLength, setPageLength] = useState(pageLengthOpts[0]);
  const [numPages, setNumPages] = useState(Math.ceil(data.length / pageLength));

  useEffect(() => {
    setNumPages(Math.ceil(data.length / pageLength));
    if (page > numPages && numPages > 0) {
      pageChanged(numPages);
    }
    if (page <= 0) {
      pageChanged(1);
    }
  }, [pageLength, data.length, page, numPages]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > numPages) {
      return;
    }
    pageChanged(newPage);
    if (pageChanged) {
      pageChanged(newPage);
    }
  };

  const iconClasses = 'h-5 cursor-pointer';

  return (
    <div className="flex flex-col items-center w-full gap-6">
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data
          .slice((page - 1) * pageLength, page * pageLength)
          .map(dataRenderer)}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          {firstLastPageVisible ? (
            <ChevronDoubleLeftIcon
              className={iconClasses}
              onClick={() => handlePageChange(1)}
              aria-label="first page"
            />
          ) : null}
          <ChevronLeftIcon
            className={iconClasses}
            onClick={() => handlePageChange(page - 1)}
            aria-label="previous page"
          />
          <div className="w-16 text-center">{`${page} of ${numPages}`}</div>
          <ChevronRightIcon
            className={iconClasses}
            onClick={() => handlePageChange(page + 1)}
            aria-label="next page"
          />
          {firstLastPageVisible ? (
            <ChevronDoubleRightIcon
              className={iconClasses}
              onClick={() => handlePageChange(numPages)}
              aria-label="last page"
            />
          ) : null}
        </div>
        <DropdownMenu
          listOfItems={pageLengthOpts}
          state={pageLength}
          setState={val => setPageLength(val)}
          label="products per page"
          aria-label="page length options"
        />
      </div>
    </div>
  );
};

export default PaginatedData;