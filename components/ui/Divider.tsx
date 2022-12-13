import React from 'react';

interface DividerProps {
  children?: React.ReactNode;
  width?: string;
}

const Divider = ({ children, width }: DividerProps) => {
  return (
    <div className={`${width ?? 'w-full'} relative flex items-center py-5`}>
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
