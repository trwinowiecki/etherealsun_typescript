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
                'w-full flex gap-2 items-center p-1 rounded-lg cursor-pointer',
                { 'bg-primary-background-darker': checked }
              )}
            >
              <CheckIcon
                className={cn('inline-flex h-5 invisible', {
                  visible: checked
                })}
              />
              <div className={cn('w-full overflow-visible', option.className)}>
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
