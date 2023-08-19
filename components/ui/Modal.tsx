import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';

import Button from './Button';

interface ModalProps {
  children: React.ReactNode;
  name: string;
  hasButton?: boolean;
  open?: boolean;
  closeButton?: boolean;
  modalClosed?: (val: any) => void;
  minHeight?: string;
}

const Modal = ({
  name,
  children,
  hasButton = false,
  open = false,
  closeButton = true,
  modalClosed = () => {},
  minHeight = 'min-h-[75vh]'
}: ModalProps) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  function closeModal() {
    setIsOpen(false);
    modalClosed(null);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      {hasButton ?? (
        <div className="">
          <button
            type="button"
            onClick={openModal}
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          >
            {name}
          </button>
        </div>
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={`${minHeight} w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all`}
                >
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-primary-text"
                  >
                    {name}
                  </Dialog.Title>
                  <div className="mt-2 mb-14 max-h-[75vh] overflow-y-auto">
                    {children}
                  </div>
                  {closeButton && (
                    <div className="mt-4">
                      <Button
                        extraClasses="absolute bottom-6 right-6"
                        onClick={closeModal}
                      >
                        Done
                      </Button>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Modal;
