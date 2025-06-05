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
    'px-4 py-1 disabled:bg-gray-200 disabled:border-gray-200 disabled:cursor-not-allowed rounded-[3px] flex items-center justify-center cursor-pointer flex items-center justify-center disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'text-white border border-primary bg-primary enabled:hover:opacity-95',
    outline:
      'border border-solid border-light-silver bg-transparent text-lead enabled:hover:shadow-sm',
    text: 'border-none bg-none text-primary hover:text-primary/80 hover:underline',
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
