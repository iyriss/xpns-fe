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
    'px-4 py-2 disabled:opacity-50 rounded-[3px] flex items-center justify-center text-white cursor-pointer flex items-center justify-center disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'border border-primary bg-primary enabled:hover:opacity-95',
    outline: 'border border-solid border-lead bg-transparent text-lead enabled:hover:shadow',
    text: 'border-none bg-none hover:text-primary',
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
