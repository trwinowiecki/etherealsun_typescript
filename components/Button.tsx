import { NextPage } from 'next';

interface ButtonProps {
  children: React.ReactNode;
  extraClasses?: string;
  onClick: () => void;
}

const Button: NextPage<ButtonProps> = ({
  children,
  extraClasses = '',
  onClick
}) => {
  return (
    <button
      className={`${extraClasses} bg-primary hover:bg-primary-darker py-2 px-4 rounded-md`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
