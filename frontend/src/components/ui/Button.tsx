import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
    const variants: Record<Variant, string> = {
      primary: 'bg-brand-primary text-white hover:bg-brand-strong hover:shadow-elevated',
      secondary: 'bg-white text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/5 hover:border-brand-primary/30',
      ghost: 'text-ink-muted hover:bg-gray-100 hover:text-ink',
      danger: 'bg-error text-white hover:bg-red-700',
    };
    const sizes: Record<Size, string> = {
      sm: 'px-3.5 py-2 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };
    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
