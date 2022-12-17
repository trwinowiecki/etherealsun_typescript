import { Disclosure, RadioGroup } from '@headlessui/react';
import { CheckIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export interface FilterField<TFilterType> {
  name: string;
  description?: string;
  values: TFilterType[];
  displayValues?: string[];
  selected: TFilterType;
  defaultValue?: TFilterType;
  type: 'radio' | 'check' | 'range' | 'color';
}

interface FilterProps {
  fields: FilterField<any>[];
  setSelected: (val: any, field: FilterField<any>) => void;
}

const Filter = ({ fields, setSelected }: FilterProps) => {
  fields.forEach(field => {
    if (!field.selected && field.defaultValue) {
      setSelected(field.defaultValue, field);
    }
  });
  return (
    <div className="z-20 flex flex-col w-full h-full gap-2 overflow-y-auto">
      {fields.map(field => (
        <Disclosure
          key={field.name}
          as="div"
          className="px-4 py-2 bg-primary-background rounded-xl"
        >
          {({ open }) => (
            <>
              <Disclosure.Button className="flex items-center justify-between w-full">
                <span>{field.name}</span>
                <ChevronUpIcon
                  className={`${open ? 'transform rotate-180' : ''} w-5 h-5`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-2">
                <div className={field.description ? 'pb-2 text-xs' : 'hidden'}>
                  {field.description}
                </div>
                <RadioGroup
                  value={field.selected}
                  onChange={event => setSelected(event, field)}
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
                              <div className="w-full overflow-x-auto">
                                {val}
                              </div>
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
                              <div className="w-full overflow-x-auto">
                                {val}
                              </div>
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
