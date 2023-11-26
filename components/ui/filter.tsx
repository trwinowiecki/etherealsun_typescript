import { Disclosure, RadioGroup } from '@headlessui/react';
import { CheckIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { CatalogObject } from 'square';
import useSquareFilters from '../../hooks/square-product-filter';
import { cn } from '../../utils/tw-utils';

export interface FilterField<T> {
  key: string;
  displayName: string;
  description?: string;
  values: T[];
  renderValue: (val: T) => string;
  selected: T | null;
  type: 'radio' | 'check' | 'range' | 'color';
}

interface FilterProps {
  products: CatalogObject[];
  onFilterChange: (filteredProducts: CatalogObject[]) => void;
}

const Filter = ({ products, onFilterChange }: FilterProps) => {
  const { filteredProducts, updateFilters, filters } =
    useSquareFilters(products);

  useEffect(() => {
    onFilterChange(filteredProducts);
  }, [filteredProducts]);

  const handleFilterSelected = (
    filter: FilterField<string>,
    value: string | null
  ) => {
    updateFilters([{ key: filter.key, value }]);
  };

  return (
    <div className="z-20 flex flex-col w-full h-full gap-2 overflow-y-auto">
      {filters.map(filter => (
        <Disclosure
          key={filter.key}
          as="div"
          className="px-4 py-2 bg-primary-background rounded-xl"
        >
          {({ open }) => (
            <>
              <Disclosure.Button className="flex items-center justify-between w-full">
                <span>{filter.displayName}</span>
                <ChevronUpIcon
                  className={cn('w-5 h-5', { 'transform rotate-180': open })}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-2">
                <div
                  className={cn('pb-2 text-xs hidden', {
                    block: filter.description
                  })}
                >
                  {filter.description}
                </div>
                <RadioGroup value={filter.selected}>
                  {filter.values
                    ? filter.values.map((val, i) => (
                        <RadioGroup.Option
                          key={filter.values[i]}
                          value={val}
                          onClick={() => handleFilterSelected(filter, val)}
                        >
                          {({ checked }) => (
                            <div
                              className={cn(
                                'w-full flex gap-2 items-center p-1 rounded-lg cursor-pointer',
                                { 'bg-primary-background-darker': checked }
                              )}
                            >
                              <CheckIcon
                                className={cn('inline-flex h-5 invisible', {
                                  visible: checked
                                })}
                              />
                              <div className="w-full overflow-x-auto">
                                {filter.renderValue(val)}
                              </div>
                            </div>
                          )}
                        </RadioGroup.Option>
                      ))
                    : null}
                </RadioGroup>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
};

export default Filter;
