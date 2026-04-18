import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatRSD } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, getSubtotal, getTotalItems } = useCartStore();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const shipping = subtotal > 5000 ? 0 : 350; // Besplatna dostava preku 5000 RSD
  const pdv = subtotal * 0.2; // 20% mock PDV
  const isFreeShipping = shipping === 0;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-surface-subtle rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-text-muted" />
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-4">Vaša korpa je prazna</h1>
        <p className="text-text-muted mb-8">Niste još dodali ni jedan proizvod. Pregledajte naš asortiman.</p>
        <Link to="/shop">
          <Button variant="primary" size="lg" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Vrati se u prodavnicu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Vaša korpa</h1>
      <p className="text-text-muted mb-8">Pregledajte {getTotalItems()} proizvoda i nastavite ka plaćanju.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CART ITEMS LIST */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardContent className="p-0">
              <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-surface-border bg-surface-subtle text-xs font-semibold text-text-muted uppercase tracking-wider rounded-t-2xl">
                <div className="col-span-6">Proizvod</div>
                <div className="col-span-3 text-center">Količina</div>
                <div className="col-span-2 text-right">Cena</div>
                <div className="col-span-1"></div>
              </div>

              <div className="flex flex-col divide-y divide-surface-border">
                {items.map((item) => (
                  <div key={item.productId} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 sm:p-6 items-center">
                    
                    {/* Product Info */}
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="w-20 h-20 bg-surface-subtle rounded-xl flex items-center justify-center shrink-0 p-2">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex flex-col">
                        <Link to={`/shop/${item.productId}`} className="font-medium text-text-primary hover:text-primary transition-colors line-clamp-2">
                          {item.name}
                        </Link>
                        <span className="text-xs text-text-muted mt-1">1 kom: {formatRSD(item.price)}</span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="col-span-3 flex justify-center mt-4 sm:mt-0">
                      <div className="flex items-center">
                        <Button 
                          variant="secondary" size="icon" className="h-8 w-8 rounded-r-none border-r-0"
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <Input 
                          className="h-8 w-12 rounded-none text-center border-x-0 px-2"
                          value={item.quantity}
                          readOnly
                        />
                        <Button 
                          variant="secondary" size="icon" className="h-8 w-8 rounded-l-none border-l-0"
                          onClick={() => updateQuantity(item.productId, Math.min(20, item.quantity + 1))}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Total Price & Delete */}
                    <div className="col-span-2 sm:text-right font-bold text-primary mt-2 sm:mt-0 text-center sm:text-right">
                      {formatRSD(item.price * item.quantity)}
                    </div>
                    
                    <div className="col-span-1 flex justify-end sm:justify-center">
                      <button 
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Link to="/shop" className="text-sm font-medium text-primary hover:underline mt-4 inline-flex items-center gap-1 w-max">
            <ArrowLeft className="w-4 h-4" /> Dodaj još proizvoda
          </Link>
        </div>

        {/* ORDER SUMMARY */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h3 className="text-lg font-display font-semibold mb-6">Pregled narudžbine</h3>
              
              <div className="flex flex-col gap-4 text-sm mb-6 pb-6 border-b border-surface-border">
                <div className="flex justify-between">
                  <span className="text-text-muted">Iznos (bez PDV)</span>
                  <span className="font-medium text-text-primary">{formatRSD(subtotal - pdv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">PDV (20%)</span>
                  <span className="font-medium text-text-primary">{formatRSD(pdv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Dostava</span>
                  <span className={isFreeShipping ? "font-bold text-accent" : "font-medium text-text-primary"}>
                    {isFreeShipping ? "Besplatno" : formatRSD(shipping)}
                  </span>
                </div>
              </div>

              {!isFreeShipping && (
                <div className="text-xs text-text-muted text-center mb-6 bg-surface-subtle p-3 rounded-lg border border-surface-border">
                  Dodajte proizvode za još <span className="font-bold text-text-primary">{formatRSD(5000 - subtotal)}</span> i ostvarite besplatnu dostavu!
                </div>
              )}

              <div className="flex justify-between items-end mb-8">
                <span className="text-base font-semibold text-text-primary">UKUPNO</span>
                <span className="text-2xl font-display font-bold text-primary">{formatRSD(subtotal + shipping)}</span>
              </div>

              <Button 
                variant="primary" 
                size="xl" 
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/checkout')}
              >
                Nastavi na plaćanje
              </Button>

              <div className="mt-4 flex flex-wrap justify-center gap-2 grayscale opacity-50">
                <div className="w-10 h-6 bg-surface-border rounded" />
                <div className="w-10 h-6 bg-surface-border rounded" />
                <div className="w-10 h-6 bg-surface-border rounded" />
                <div className="w-10 h-6 bg-surface-border rounded" />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};
