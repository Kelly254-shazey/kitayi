type BrandLogoProps = {
  variant?: 'full' | 'mark';
  className?: string;
};

export default function BrandLogo({ variant = 'full', className = '' }: BrandLogoProps) {
  const isMark = variant === 'mark';

  return (
    <img
      src={isMark ? '/assets/kitayi-mark-square.png' : '/assets/kitayi-logo-full.png'}
      alt={isMark ? 'Kitayi icon' : 'Kitayi Solutions Limited'}
      className={`${isMark ? 'aspect-square object-cover' : 'object-contain'} ${className}`}
    />
  );
}
