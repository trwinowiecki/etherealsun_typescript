import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';

export interface FilterField {
  name: string;
  description?: string;
  values: {};
  selected: any;
  handleSelect: () => any;
  multipleSelectable: boolean;
}

interface FilterProps {
  fields: FilterField[];
}

const Filter = ({ fields }: FilterProps) => {
  return (
    <div className="">
      {fields.map((field, i) => (
        <Disclosure key={i}>
          {({ open }) => (
            <>
              <Disclosure.Button>
                <span>{field.name}</span>
                <ChevronUpIcon
                  className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`}
                />
              </Disclosure.Button>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
};

export default Filter;
