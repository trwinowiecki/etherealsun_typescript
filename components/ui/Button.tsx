import { cva, VariantProps } from 'class-variance-authority';

const buttonStyles = cva(
  'flex items-center justify-center px-4 py-2 rounded-md',
  {
    variants: {
      intent: {
        primary: 'bg-primary hover:bg-primary-darker text-primary-text',
        secondary: 'bg-secondary hover:bg-secondary-darker, text-primary-text',
        danger: ''
      },
      fullWidth: {
        true: 'w-full'
      }
    },
    defaultVariants: {
      intent: 'primary'
    }
  }
);

export interface ButtonProps
  extends VariantProps<typeof buttonStyles>,
    React.HTMLProps<HTMLButtonElement> {
  children: React.ReactNode;
  extraClasses?: string;
  onClick: () => void;
}

function Button({
  children,
  extraClasses = '',
  onClick,
  intent,
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${buttonStyles({ intent, fullWidth })} ${extraClasses}`}
      onClick={onClick}
      {...props}
      type="button"
    >
      {children}
    </button>
  );
}

export default Button;
