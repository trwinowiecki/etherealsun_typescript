import { Fragment } from 'react';

interface CheckoutStepperProps {
  activeStep: number;
  steps: { title: string; enabled: boolean }[];
}

const CheckoutSteps = ({ activeStep = 0, steps }: CheckoutStepperProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-4">
      <div className="flex items-center justify-center w-full gap-2 lg:w-[75%]">
        {steps.map((step, index) => (
          <Fragment key={step.title}>
            <div
              className={`${index === activeStep ? 'font-bold' : ''} ${
                index <= activeStep ? 'text-secondary' : ''
              } `}
            >
              {step.title}
            </div>
            {index !== steps.length - 1 && (
              <div className="flex-grow border-t border-opacity-50 border-primary-text" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default CheckoutSteps;
