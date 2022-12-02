import React from 'react';

interface DividerProps {
  children?: React.ReactNode;
}

const Divider = ({ children }: DividerProps) => {
  return (
    <div className="relative flex items-center w-full py-5">
      {children ? (
        <>
          <div className="flex-grow border-t border-opacity-50 border-primary-text" />
          <span className="flex-shrink mx-4 text-primary-text">{children}</span>
          <div className="flex-grow border-t border-opacity-50 border-primary-text" />
        </>
      ) : (
        <div className="flex-grow border-t border-opacity-50 border-primary-text" />
      )}
    </div>
  );
};

export default Divider;
