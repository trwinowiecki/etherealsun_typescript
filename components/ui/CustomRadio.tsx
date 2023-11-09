import { RadioGroup } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { cn } from '../../utils/tw-utils';

export type RadioOption<T> = {
  key: string;
  value: T;
  displayValue: React.ReactNode;
  className?: string;
};

type CustomRadioProps<T = any> = {
  options: RadioOption<T>[];
  selected: T;
  setSelected: (val: T) => void;
};

const CustomRadio = (props: CustomRadioProps) => {
  return (
    <RadioGroup
      value={props.selected}
      onChange={event => props.setSelected(event)}
    >
      {props.options.map(option => (
        <RadioGroup.Option key={option.key} value={option.value}>
          {({ checked }) => (
            <div
              className={cn(
                'group w-full flex gap-2 items-center py-1 px-2 rounded-lg cursor-pointer',
                { 'bg-primary-background-darker': checked }
              )}
            >
              <CheckIcon
                className={cn(
                  'inline-flex h-5 invisible stroke-[2.5] group-hover:stroke-[5]',
                  {
                    visible: checked
                  }
                )}
              />
              <div
                className={cn(
                  'group-hover:font-bold overflow-visible w-[calc(100%+100px)]',
                  option.className
                )}
              >
                {option.displayValue}
              </div>
            </div>
          )}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
};

export default CustomRadio;
