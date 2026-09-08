import React from 'react';

interface CompanyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'Logo Empresa RV',
}) => {
  const sizeClasses = {
    sm: 'h-7 w-auto',
    md: 'h-9 w-auto',
    lg: 'h-14 w-auto',
    xl: 'h-20 w-auto',
  };

  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`object-contain select-none transition-all ${sizeClasses[size]} ${className}`}
      loading="eager"
    />
  );
};
