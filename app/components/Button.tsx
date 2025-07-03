export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'text';
}

export const Button: React.FC<ButtonProps> = ({
  loading,
  variant = 'primary',
  className,
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    'px-6 py-3 font-medium disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50';

  const variantStyles = {
    primary: 'text-white bg-primary enabled:hover:bg-primary-active',
    outline: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    text: 'border-none bg-none text-primary hover:text-primary-active hover:underline',
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className='flex items-center justify-center gap-10'>
          <div>{children}</div>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
