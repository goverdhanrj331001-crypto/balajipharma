import { cn } from '@/lib/utils';
import { Icon } from './icon';

interface ProductArtProps {
  product: { icon: string; tint: string; imageUrl?: string; name?: string };
  className?: string;
}

export function ProductArt({ product, className = '' }: ProductArtProps) {
  if (product.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name ?? 'Product image'}
        className={cn('object-cover', className)}
      />
    );
  }
  return (
    <div
      className={cn('asset-art flex items-center justify-center', className)}
      style={{ backgroundColor: product.tint }}
    >
      <div className="product-glyph">
        <Icon name={product.icon} className="text-[42px]" />
      </div>
    </div>
  );
}
