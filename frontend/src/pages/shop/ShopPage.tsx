import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, Search, X, Package } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { productsApi, type ProductListDto, type ProductFilterParams } from '@/api/products';
import { categoriesApi, type CategoryDto } from '@/api/categories';

// Map backend ProductListDto to the shape ProductCard expects
function mapToCardProduct(dto: ProductListDto) {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    price: dto.price,
    compareAtPrice: dto.compareAtPrice,
    imageUrl: dto.imageUrl ?? `https://placehold.co/400x400/1A6B3A/FFFFFF?text=${encodeURIComponent(dto.name.slice(0, 12))}`,
    rating: dto.averageRating,
    reviewsCount: dto.reviewCount,
    isNew: dto.isFeatured,
    stockStatus: dto.isLowStock
      ? ('low_stock' as const)
      : dto.stockQuantity === 0
      ? ('out_of_stock' as const)
      : ('in_stock' as const),
    category: dto.categoryName,
  };
}

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Preporučeno' },
  { value: 'price_asc', label: 'Cena: Od najniže' },
  { value: 'price_desc', label: 'Cena: Od najviše' },
  { value: 'newest', label: 'Najnovije' },
];

const MAX_PRICE = 50000;

export const ShopPage: React.FC = () => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sortValue, setSortValue] = useState('recommended');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isSmartDevice, setIsSmartDevice] = useState<boolean | undefined>();

  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearchQuery(value), 400);
  };

  // Fetch categories once
  useEffect(() => {
    categoriesApi.getAll()
      .then(setCategories)
      .catch(() => {}); // silently fail — categories are non-critical
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      const [sortBy, sortDirection] = (() => {
        if (sortValue === 'price_asc') return ['price', 'asc'];
        if (sortValue === 'price_desc') return ['price', 'desc'];
        if (sortValue === 'newest') return ['createdAt', 'desc'];
        return ['featured', 'desc'];
      })();

      const filter: ProductFilterParams = {
        page: 1,
        pageSize: 24,
        search: searchQuery || undefined,
        categoryId: selectedCategoryId,
        sortBy,
        sortDirection,
        maxPrice: maxPrice < MAX_PRICE ? maxPrice : undefined,
        isSmartDevice,
      };

      try {
        const result = await productsApi.getProducts(filter);
        setProducts(result.items);
        setTotalCount(result.totalCount);
      } catch (err) {
        setError('Greška pri učitavanju proizvoda. Proverite da li je server aktivan.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategoryId, maxPrice, sortValue, isSmartDevice]);

  const handleReset = () => {
    setSearchInput('');
    setSearchQuery('');
    setMaxPrice(MAX_PRICE);
    setSortValue('recommended');
    setSelectedCategoryId(undefined);
    setInStockOnly(false);
    setIsSmartDevice(undefined);
  };

  const FilterContent = () => (
    <div className="flex flex-col gap-6">
      {/* Categories */}
      <div>
        <h4 className="font-semibold mb-3 text-text-primary">Kategorije</h4>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={!selectedCategoryId}
              onChange={() => setSelectedCategoryId(undefined)}
              className="text-primary focus:ring-primary"
            />
            Sve kategorije
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategoryId === cat.id}
                onChange={() => setSelectedCategoryId(cat.id)}
                className="text-primary focus:ring-primary"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-text-primary">Maks. cena</h4>
          <span className="text-xs font-medium text-primary">{maxPrice.toLocaleString('sr-RS')} RSD</span>
        </div>
        <RangeSlider min={0} max={MAX_PRICE} step={500} value={maxPrice} onChange={setMaxPrice} />
      </div>

      {/* Availability */}
      <div>
        <h4 className="font-semibold mb-3 text-text-primary">Dostupnost</h4>
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded text-primary focus:ring-primary border-surface-border"
          />
          Samo na stanju
        </label>
      </div>

      {/* Device type */}
      <div>
        <h4 className="font-semibold mb-3 text-text-primary">Tip uređaja</h4>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary cursor-pointer">
            <input type="radio" name="deviceType" checked={isSmartDevice === undefined} onChange={() => setIsSmartDevice(undefined)} className="text-primary" />
            Svi
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary cursor-pointer">
            <input type="radio" name="deviceType" checked={isSmartDevice === true} onChange={() => setIsSmartDevice(true)} className="text-primary" />
            Smart uređaji
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary cursor-pointer">
            <input type="radio" name="deviceType" checked={isSmartDevice === false} onChange={() => setIsSmartDevice(false)} className="text-primary" />
            LED Rasveta
          </label>
        </div>
      </div>

      <Button variant="secondary" className="w-full mt-2" onClick={handleReset}>
        Resetuj filtere
      </Button>
    </div>
  );

  // Skeleton loader
  const ProductSkeleton = () => (
    <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-surface-subtle" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-surface-subtle rounded-full w-3/4" />
        <div className="h-3 bg-surface-subtle rounded-full w-1/2" />
        <div className="h-4 bg-surface-subtle rounded-full w-1/3 mt-4" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Prodavnica</h1>
          <p className="text-text-muted">
            {isLoading ? 'Učitavanje...' : `${totalCount} ${totalCount === 1 ? 'proizvod' : 'proizvoda'}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Pretraži proizvode..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 w-full bg-surface-subtle"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              className="lg:hidden flex-1"
              onClick={() => setIsMobileFiltersOpen(true)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Filteri
            </Button>
            <div className="w-[180px] hidden sm:block">
              <Select
                options={SORT_OPTIONS}
                value={sortValue}
                onChange={(val) => setSortValue(val)}
                placeholder="Sortiraj"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="relative bg-surface-card w-full h-[80vh] rounded-t-2xl p-6 overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-surface-card z-10 pb-2 border-b border-surface-border">
              <h3 className="font-display font-bold text-xl">Filteri</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <FilterContent />
            <div className="sticky bottom-0 bg-surface-card pt-4 pb-2 mt-4 border-t border-surface-border">
              <Button variant="primary" className="w-full" onClick={() => setIsMobileFiltersOpen(false)}>
                Primeni filtere
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex gap-8">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" /> Filteri
            </h3>
            <FilterContent />
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <div className="flex-1">
          {error && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Package className="w-16 h-16 text-text-muted mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">Greška pri učitavanju</h3>
              <p className="text-text-muted max-w-sm">{error}</p>
            </div>
          )}

          {!error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                  : products.map((product) => (
                      <ProductCard key={product.id} product={mapToCardProduct(product)} />
                    ))}
              </div>

              {!isLoading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Package className="w-16 h-16 text-text-muted mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Nema proizvoda</h3>
                  <p className="text-text-muted mb-6">Pokušajte da promenite filtere ili pretragu.</p>
                  <Button variant="secondary" onClick={handleReset}>Resetuj filtere</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
