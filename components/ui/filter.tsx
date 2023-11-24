import { Disclosure, RadioGroup } from '@headlessui/react';
import { CheckIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/tw-utils';

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
                  className={cn('w-5 h-5', { 'transform rotate-180': open })}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-2">
                <div
                  className={cn('pb-2 text-xs hidden', {
                    block: field.description
                  })}
                >
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
                              className={cn({
                                'bg-primary-background-darker': checked
                              })}
                            >
                              <CheckIcon
                                className={cn(
                                  'w-full h-5 gap-2 items-center p-1 rounded-lg cursor-pointer inline-flex invisible',
                                  { visible: checked }
                                )}
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
