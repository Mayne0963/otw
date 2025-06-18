'use client';

import Link from 'next/link';

export default function Button({
  href,
  variant = 'primary',
  children,
  className = '',
  fullWidth = false,
  size = 'md',
  disabled = false,
  onClick,
  ...props
}) {
  const baseClasses =
    'otw-button otw-focus font-semibold inline-flex items-center justify-center rounded-xl border transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-12 py-6 text-xl',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-otw-red to-otw-red/90 text-white border-otw-red/50 hover:from-otw-red/90 hover:to-otw-red/80 hover:border-otw-red/70 hover:shadow-otw-xl hover:shadow-otw-red/30 focus:ring-otw-red',
    secondary:
      'bg-gradient-to-r from-otw-gold to-otw-gold/90 text-otw-black border-otw-gold/50 hover:from-otw-gold/90 hover:to-otw-gold/80 hover:border-otw-gold/70 hover:shadow-otw-xl hover:shadow-otw-gold/30 focus:ring-otw-gold font-bold',
    outline:
      'bg-transparent text-otw-gold border-otw-gold/50 hover:bg-otw-gold/10 hover:border-otw-gold hover:shadow-otw-lg hover:shadow-otw-gold/20 focus:ring-otw-gold',
    ghost:
      'bg-transparent text-white border-transparent hover:bg-white/10 hover:border-white/20 hover:shadow-lg focus:ring-white/50',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;

  if (href && !disabled) {
    return (
      <Link 
        href={href} 
        className={buttonClasses} 
        onClick={onClick}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button 
      className={buttonClasses} 
      disabled={disabled} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
