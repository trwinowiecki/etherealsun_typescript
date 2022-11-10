import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';

export interface FilterField {
  name: string;
  description?: string;
  values: {};
  selected: any;
  handleSelect: (val: any) => void;
  multipleSelectable: boolean;
}

interface FilterProps {
  fields: FilterField[];
}

const Filter = ({ fields }: FilterProps) => {
  return (
    <div className="w-full">
      {fields.map((field, i) => (
        <Disclosure key={i}>
          {({ open }) => (
            <>
              <Disclosure.Button className={'flex gap-2'}>
                <span>{field.name}</span>
                <ChevronUpIcon
                  className={`${open ? 'transform rotate-180' : ''} w-5 h-5`} />
              </Disclosure.Button>
              <Disclosure.Panel>
                <span>{field.description}</span>
                {field.values.map(val => (
                  <div key={val}>{val}</div>
                ))}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
};

export default Filter;
