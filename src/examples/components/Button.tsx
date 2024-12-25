import React, { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

// Button component without dependencies just to test the Provider
const Button: FC<Props> = ({ children, onClick, className = '', disabled = false }) => {
  const buttonStyles = {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    backgroundColor: disabled ? '#D1D5DB' : '#3B82F6',
    color: '#FFFFFF',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.3s ease',
    ...(disabled ? {} : { backgroundColor: '#2563EB' }),
  };

  return (
    <button onClick={onClick} disabled={disabled} style={buttonStyles} className={className}>
      {children}
    </button>
  );
};

export default Button;
