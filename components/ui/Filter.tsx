import { Disclosure, RadioGroup } from '@headlessui/react';
import { CheckIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export interface FilterField<FilterType> {
  name: string;
  description?: string;
  values: FilterType[];
  displayValues?: string[];
  selected: FilterType;
  defaultValue?: FilterType;
  setSelected: (val: FilterType, field: FilterField<FilterType>) => void;
  type: 'radio' | 'check' | 'range' | 'color';
}

interface FilterProps {
  fields: FilterField<any>[];
}

const Filter = ({ fields }: FilterProps) => {
  fields.forEach(field => {
    if (!field.selected && field.defaultValue) {
      field.setSelected(field.defaultValue, field);
    }
  });
  return (
    <div className="w-full h-full flex flex-col gap-2 overflow-y-auto">
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
                  onChange={e => field.setSelected(e, field)}
                >
                  {field.displayValues
                    ? field.displayValues.map((val, i) => (
                        <RadioGroup.Option
                          key={field.values[i]}
                          value={field.values[i]}
                        >
                          {({ checked }) => (
                            <div
                              className={`${
                                checked ? 'bg-primary-background-darker' : ''
                              } w-full flex gap-2 items-center p-1 rounded-lg cursor-pointer`}
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
                      ))
                    : field.values.map(val => (
                        <RadioGroup.Option key={val} value={val}>
                          {({ checked }) => (
                            <div
                              className={`${
                                checked ? 'bg-primary-background-darker' : ''
                              } w-full flex gap-2 items-center p-1 rounded-lg cursor-pointer`}
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
