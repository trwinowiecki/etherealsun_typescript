import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/tw-utils';

const buttonStyles = cva(
  'flex items-center justify-center px-4 py-2 rounded-md',
  {
    variants: {
      intent: {
        primary: 'bg-primary hover:bg-primary-darker text-primary-text',
        secondary: 'bg-secondary hover:bg-secondary-darker, text-primary-text',
        danger: 'bg-negative'
      }
    },
    defaultVariants: {
      intent: 'primary'
    }
  }
);

export type ButtonProps = VariantProps<typeof buttonStyles> &
  React.HTMLProps<HTMLButtonElement> & {
    children: React.ReactNode;
    className?: string;
    onClick: () => void;
  };

function Button({
  children,
  className: extraClasses = '',
  onClick,
  intent,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonStyles({
          intent
        }),
        extraClasses,
        'disabled:bg-slate-400'
      )}
      onClick={onClick}
      {...props}
      type="button"
    >
      {children}
    </button>
  );
}

export default Button;
