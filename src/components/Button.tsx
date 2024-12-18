import { FC } from 'react';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

// Button component without dependencies just to test the Provider
const Button: FC<Props> = ({ children, onClick, className = '', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
