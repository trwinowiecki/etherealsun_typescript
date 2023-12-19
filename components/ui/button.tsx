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
      },
      iconButton: {
        true: 'p-2 rounded-full focus:rounded-full'
      }
    },
    defaultVariants: {
      intent: 'primary'
    }
  }
);

export type ButtonProps = VariantProps<typeof buttonStyles> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    className?: string;
  } & ({ onClick: () => void } | { type: 'submit' });

function Button({
  iconButton = false,
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
          intent,
          iconButton
        }),
        extraClasses,
        'disabled:bg-slate-400 disabled:cursor-not-allowedrad'
      )}
      onClick={onClick}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
