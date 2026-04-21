import React, { useState } from 'react';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import type { Product } from '@/components/shop/ProductCard';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/RangeSlider';

// MOCK DATA
const MOCK_PRODUCTS: Product[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `prod-${i}`,
  name: i % 2 === 0 ? `LumiSave E27 Pro ${10+i}W Smart LED` : `Eco Lumi Smart Plug V${i}`,
  price: 500 + i * 200,
  compareAtPrice: i % 3 === 0 ? 800 + i * 200 : undefined,
  imageUrl: `https://via.placeholder.com/400/${i%2===0?'22C55E/FFFFFF':'1A6B3A/FFFFFF'}?text=Product+${i}`,
  rating: 4 + (i % 5) * 0.2,
  reviewsCount: 12 + i * 5,
  isNew: i === 0 || i === 1,
  stockStatus: i === 3 ? 'low_stock' : i === 7 ? 'out_of_stock' : 'in_stock',
  category: i % 2 === 0 ? 'rasveta' : 'smarthome'
}));

export const ShopPage: React.FC = () => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(5000);

  const sortOptions = [
    { value: 'recommended', label: 'Preporučeno' },
    { value: 'price_asc', label: 'Cena: Od najniže' },
    { value: 'price_desc', label: 'Cena: Od najviše' },
    { value: 'newest', label: 'Najnovije' },
  ];

  const FilterContent = () => (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="font-semibold mb-3 text-text-primary">Kategorije</h4>
        <div className="flex flex-col gap-2">
          {['Sve komponente', 'LED Rasveta', 'Smart Utičnice', 'Senzori & Automatika'].map(cat => (
            <label key={cat} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary cursor-pointer">
              <input type="checkbox" className="rounded text-primary focus:ring-primary border-surface-border" />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-text-primary">Maks. cena</h4>
          <span className="text-xs font-medium text-primary">{priceRange} RSD</span>
        </div>
        <RangeSlider min={0} max={10000} step={100} value={priceRange} onChange={setPriceRange} />
      </div>

      <div>
        <h4 className="font-semibold mb-3 text-text-primary">Dostupnost</h4>
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input type="checkbox" className="rounded text-primary focus:ring-primary border-surface-border" />
          Samo na stanju
        </label>
      </div>

      <div>
        <h4 className="font-semibold mb-3 text-text-primary">Proizvođač</h4>
        <div className="flex flex-col gap-2 relative">
          {['LumiSave', 'Philips Hue', 'Shelly', 'Tuya'].map(brand => (
             <label key={brand} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary cursor-pointer">
             <input type="checkbox" className="rounded text-primary focus:ring-primary border-surface-border" />
             {brand}
           </label>
          ))}
        </div>
      </div>
      
      <Button variant="secondary" className="w-full mt-4">Resetuj filtere</Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Prodavnica</h1>
          <p className="text-text-muted">Izabran najefikasniji hardver na jednom mestu.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input 
              placeholder="Pretraži proizvode..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <Select options={sortOptions} value="recommended" onChange={() => {}} placeholder="Sortiraj" />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET FOR FILTERS */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="relative bg-surface-card w-full h-[80vh] rounded-t-2xl p-6 overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-surface-card z-10 pb-2 border-b border-surface-border">
              <h3 className="font-display font-bold text-xl">Filteri</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)}>
                <X className="w-5 h-5"/>
              </Button>
            </div>
            <FilterContent />
            <div className="sticky bottom-0 bg-surface-card pt-4 pb-2 mt-4 border-t border-surface-border">
              <Button variant="primary" className="w-full" onClick={() => setIsMobileFiltersOpen(false)}>Primeni filtere</Button>
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
          <div className="mb-4 text-sm text-text-muted lg:hidden flex justify-between items-center">
            <span>Prikazano 12 proizvoda</span>
            <div className="w-[140px] sm:hidden">
              <Select options={sortOptions} value="recommended" onChange={() => {}} placeholder="Sortiraj" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MOCK_PRODUCTS.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button variant="secondary" size="lg" isLoading={false}>Učitaj još proizvoda</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
