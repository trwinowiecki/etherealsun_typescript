import { Disclosure, RadioGroup } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { CheckIcon } from '@heroicons/react/24/outline';
import { AfterpayUnsupportedCurrencyError } from '@square/web-sdk';

export interface FilterField {
  name: string;
  description?: string;
  values: {};
  selected: any;
  setSelected: (val: any) => void;
  type: 'radio' | 'check' | 'range' | 'color';
}

interface FilterProps {
  fields: FilterField[];
}

const Filter = ({ fields }: FilterProps) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {fields.map((field, i) => (
        <Disclosure
          key={i}
          as={'div'}
          className={'bg-primary-background px-4 py-2 rounded-xl'}
        >
          {({ open }) => (
            <>
              <Disclosure.Button
                className={'w-full flex justify-between items-center'}
              >
                <span>{field.name}</span>
                <ChevronUpIcon
                  className={`${open ? 'transform rotate-180' : ''} w-5 h-5`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className={'pt-2'}>
                <div className={field.description ? 'pb-2 text-xs' : 'hidden'}>
                  {field.description}
                </div>
                <RadioGroup
                  value={field.selected}
                  onChange={e => field.setSelected(e)}
                >
                  {field.values.map(val => (
                    <RadioGroup.Option key={val} value={val}>
                      {({ checked }) => (
                        <div
                          className={`${
                            checked ? 'bg-primary-background-darker' : ''
                          } w-full flex gap-2 items-center p-1 rounded-lg`}
                        >
                          <CheckIcon
                            className={`${
                              checked ? 'inline-flex' : 'invisible'
                            } h-5`}
                          />
                          <span>{val}</span>
                        </div>
                      )}
                    </RadioGroup.Option>
                  ))}
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
