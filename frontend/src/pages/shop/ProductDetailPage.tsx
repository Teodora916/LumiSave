import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Check, Package, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/stores/cartStore';
import { formatRSD } from '@/lib/utils';
import { productsApi, type ProductDetailDto } from '@/api/products';
import { toast } from 'sonner';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [product, setProduct] = React.useState<ProductDetailDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  React.useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    productsApi.getBySlug(slug)
      .then(setProduct)
      .catch(() => setError('Proizvod nije pronađen.'))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stockQuantity === 0) {
      toast.error('Proizvod trenutno nije na stanju.');
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      imageUrl: product.imageUrls?.[0] ?? product.imageUrl,
    });
    toast.success(`Uspešno dodato u korpu: ${product.name}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-surface-subtle rounded-2xl" />
          <div className="space-y-6">
            <div className="h-8 bg-surface-subtle rounded-full w-3/4" />
            <div className="h-4 bg-surface-subtle rounded-full w-1/2" />
            <div className="h-12 bg-surface-subtle rounded-xl w-1/3" />
            <div className="space-y-2">
              <div className="h-3 bg-surface-subtle rounded-full" />
              <div className="h-3 bg-surface-subtle rounded-full w-5/6" />
              <div className="h-3 bg-surface-subtle rounded-full w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">{error ?? 'Proizvod nije pronađen'}</h1>
        <Button onClick={() => navigate('/shop')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Nazad u prodavnicu
        </Button>
      </div>
    );
  }

  const images = product.imageUrls?.length > 0
    ? product.imageUrls
    : product.imageUrl
    ? [product.imageUrl]
    : [`https://placehold.co/600x600/1A6B3A/FFFFFF?text=${encodeURIComponent(product.name.slice(0, 12))}`];

  const stockStatus = product.stockQuantity === 0
    ? 'out_of_stock'
    : product.isLowStock
    ? 'low_stock'
    : 'in_stock';

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
        <Link to="/shop" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Prodavnica
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-surface-subtle rounded-2xl overflow-hidden border border-surface-border group">
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            {discount && (
              <div className="absolute top-4 left-4">
                <Badge variant="sale">-{discount}%</Badge>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                    i === activeImageIndex ? 'border-primary' : 'border-surface-border hover:border-primary/50'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Category & badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-sm text-text-muted bg-surface-subtle px-3 py-1 rounded-full border border-surface-border">
              {product.categoryName}
            </span>
            {product.isSmartDevice && (
              <span className="text-sm text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Smart
              </span>
            )}
            {product.isFeatured && <Badge variant="new">Istaknuto</Badge>}
          </div>

          <h1 className="text-3xl font-display font-bold text-text-primary mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(product.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-surface-border'}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.averageRating.toFixed(1)}</span>
            <span className="text-sm text-text-muted">({product.reviewCount} recenzija)</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-display font-bold text-primary">{formatRSD(Number(product.price))}</span>
            {product.compareAtPrice && (
              <span className="text-xl text-text-muted line-through mb-1">{formatRSD(Number(product.compareAtPrice))}</span>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-text-secondary mb-6 leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Stock indicator */}
          <div className={`flex items-center gap-2 mb-6 text-sm font-medium ${
            stockStatus === 'in_stock' ? 'text-accent' :
            stockStatus === 'low_stock' ? 'text-orange-500' : 'text-red-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              stockStatus === 'in_stock' ? 'bg-accent' :
              stockStatus === 'low_stock' ? 'bg-orange-500' : 'bg-red-500'
            }`} />
            {stockStatus === 'in_stock' && `Na stanju (${product.stockQuantity} kom)`}
            {stockStatus === 'low_stock' && `Malo zaliha (${product.stockQuantity} kom)`}
            {stockStatus === 'out_of_stock' && 'Nije na stanju'}
          </div>

          {/* Key specs quick view */}
          {(product.wattageLed || product.wattageOld || product.colorTemperature) && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {product.wattageLed && (
                <div className="bg-surface-subtle rounded-xl p-3 border border-surface-border text-center">
                  <div className="text-lg font-bold text-primary">{product.wattageLed}W</div>
                  <div className="text-xs text-text-muted">LED snaga</div>
                </div>
              )}
              {product.wattageOld && (
                <div className="bg-surface-subtle rounded-xl p-3 border border-surface-border text-center">
                  <div className="text-lg font-bold text-text-muted">{product.wattageOld}W</div>
                  <div className="text-xs text-text-muted">Zamenjuje</div>
                </div>
              )}
              {product.colorTemperature && (
                <div className="bg-surface-subtle rounded-xl p-3 border border-surface-border text-center">
                  <div className="text-lg font-bold text-text-primary">{product.colorTemperature}K</div>
                  <div className="text-xs text-text-muted">Temperatura</div>
                </div>
              )}
            </div>
          )}

          {/* Quantity + CTA */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border border-surface-border rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
              >
                -
              </button>
              <span className="px-5 py-3 text-text-primary font-semibold min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="px-4 py-3 text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
              >
                +
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={stockStatus === 'out_of_stock'}
              leftIcon={<ShoppingCart className="w-5 h-5" />}
            >
              Dodaj u korpu
            </Button>
          </div>

          {/* Delivery info */}
          <div className="flex flex-col gap-2 p-4 bg-surface-subtle rounded-xl border border-surface-border">
            {[
              'Besplatna dostava za narudžbine iznad 5.000 RSD',
              `SKU: ${product.sku}`,
              product.brand ? `Brend: ${product.brand}` : null,
            ].filter(Boolean).map((info) => (
              <div key={info} className="flex items-center gap-2 text-sm text-text-secondary">
                <Check className="w-4 h-4 text-accent shrink-0" />
                <span>{info}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Description + Specs */}
      {(product.description || Object.keys(product.specifications ?? {}).length > 0) && (
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {product.description && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-display font-bold mb-4">Opis proizvoda</h2>
                <p className="text-text-secondary leading-relaxed">{product.description}</p>
              </CardContent>
            </Card>
          )}

          {Object.keys(product.specifications ?? {}).length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-display font-bold mb-4">Specifikacije</h2>
                <div className="divide-y divide-surface-border">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2.5 text-sm">
                      <span className="text-text-muted">{key}</span>
                      <span className="font-medium text-text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
