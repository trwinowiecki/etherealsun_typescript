import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface Props {
  listOfItems: any[];
  state: any;
  label?: string;
  setState: (val: any) => void;
}

function CustomListbox({ listOfItems, state, label, setState }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Listbox as="div" value={state} onChange={event => setState(event)}>
        <Listbox.Button className="relative py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default sm:text-sm">
          <span>{state}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon
              className="w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={React.Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-50 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 sm:text-sm">
            {listOfItems.map((item, i) => (
              <Listbox.Option
                key={item}
                value={item}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {item}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                        <CheckIcon className="w-5 h-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
      {label ? <span>{label}</span> : null}
    </div>
  );
}

export default CustomListbox;
