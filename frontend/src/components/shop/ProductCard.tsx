import React from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { formatRSD } from '@/lib/utils';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  isNew?: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  category: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    if (product.stockStatus === 'out_of_stock') {
      toast.error('Proizvod trenutno nije na stanju.');
      return;
    }
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl
    });
    
    toast.success(`Uspešno dodato: ${product.name}`);
  };

  return (
    <Link to={`/shop/${product.id}`} className="group h-full">
      <Card className="h-full flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isNew && <Badge variant="new">NOVO</Badge>}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <Badge variant="sale">AKCIJA</Badge>
          )}
          {product.stockStatus === 'low_stock' && (
            <Badge variant="low-stock">Malo zaliha!</Badge>
          )}
        </div>
        
        {/* Wishlist */}
        <button 
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm text-text-muted hover:text-red-500 transition-colors z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
          onClick={(e) => { e.preventDefault(); toast.success('Dodato u listu želja'); }}
        >
          <Heart className="w-5 h-5" />
        </button>

        {/* Image Container */}
        <div className="aspect-square bg-surface-subtle p-4 flex items-center justify-center overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{product.rating}</span>
            <span className="text-xs text-text-muted">({product.reviewsCount})</span>
          </div>

          {/* Title */}
          <h3 className="font-medium text-text-primary text-sm line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto flex items-end justify-between">
            <div className="flex flex-col">
              {product.compareAtPrice && (
                <span className="text-xs text-text-muted line-through mb-0.5">
                  {formatRSD(product.compareAtPrice)}
                </span>
              )}
              <span className="font-bold text-primary">
                {formatRSD(product.price)}
              </span>
            </div>
            
            <Button 
              size="icon" 
              variant="secondary" 
              className={product.stockStatus === 'out_of_stock' ? "opacity-50" : ""}
              onClick={handleAddToCart}
              disabled={product.stockStatus === 'out_of_stock'}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";
