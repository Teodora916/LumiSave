import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '@/stores/cartStore';
import { formatRSD } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Optional: Stripe imports if Stripe element logic is required
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Ime mora imati bar 2 karaktera'),
  lastName: z.string().min(2, 'Prezime mora imati bar 2 karaktera'),
  email: z.string().email('Unesite validnu email adresu'),
  phone: z.string().min(6, 'Unesite validan broj telefona'),
  address: z.string().min(5, 'Adresa mora biti tačna i potpuna'),
  city: z.string().min(2, 'Unesite grad'),
  postalCode: z.string().min(4, 'Unesite poštanski broj'),
  country: z.string().min(2, 'Unesite državu'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const CheckoutPage: React.FC = () => {
  const { items, getSubtotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getSubtotal();
  const shipping = subtotal > 5000 ? 0 : 350;

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: 'Srbija' }
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsProcessing(true);
    // 1. Simulate API call to backend POST /api/orders/checkout
    // 2. Here backend would return Stripe Session ID
    // 3. We would redirect to Stripe Checkout
    
    setTimeout(() => {
      // MOCK SUCCESS
      clearCart();
      toast.success("Narudžbina je uspešno kreirana!");
      navigate('/checkout/success?session_id=mock_session_123');
      setIsProcessing(false);
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
         <h1 className="text-2xl font-bold mb-4">Vaša korpa je prazna</h1>
         <Button onClick={() => navigate('/shop')}>Vrati se u prodavnicu</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* Checkout Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">1</div>
          <span className="text-sm font-medium hidden sm:block">Dostava</span>
          <div className="w-12 sm:w-24 border-t-2 border-surface-border mx-2"></div>
          
          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-surface-border text-surface-border-strong font-bold text-sm">2</div>
          <span className="text-sm font-medium text-text-muted hidden sm:block">Plaćanje</span>
          <div className="w-12 sm:w-24 border-t-2 border-surface-border mx-2 border-dashed"></div>
          
          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-surface-border text-surface-border-strong font-bold text-sm">3</div>
          <span className="text-sm font-medium text-text-muted hidden sm:block">Potvrda</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SHIPPING FORM */}
        <div className="lg:col-span-7">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-display font-bold mb-6">Podaci o isporuci i korisniku</h2>
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-primary block mb-1">Ime *</label>
                    <Input {...register('firstName')} error={!!errors.firstName} />
                    {errors.firstName && <span className="text-xs text-red-500 mt-1">{errors.firstName.message}</span>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-primary block mb-1">Prezime *</label>
                    <Input {...register('lastName')} error={!!errors.lastName} />
                    {errors.lastName && <span className="text-xs text-red-500 mt-1">{errors.lastName.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-primary block mb-1">Email adresa *</label>
                    <Input type="email" {...register('email')} error={!!errors.email} />
                    {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-primary block mb-1">Telefon *</label>
                    <Input type="tel" {...register('phone')} error={!!errors.phone} />
                    {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone.message}</span>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1">Ulica i broj *</label>
                  <Input {...register('address')} error={!!errors.address} />
                  {errors.address && <span className="text-xs text-red-500 mt-1">{errors.address.message}</span>}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1">
                    <label className="text-sm font-medium text-text-primary block mb-1">Poštanski broj *</label>
                    <Input {...register('postalCode')} error={!!errors.postalCode} />
                    {errors.postalCode && <span className="text-xs text-red-500 mt-1">{errors.postalCode.message}</span>}
                  </div>
                  <div className="lg:col-span-2">
                    <label className="text-sm font-medium text-text-primary block mb-1">Grad *</label>
                    <Input {...register('city')} error={!!errors.city} />
                    {errors.city && <span className="text-xs text-red-500 mt-1">{errors.city.message}</span>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1">Država *</label>
                  <Input {...register('country')} readOnly className="bg-surface-subtle" />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ORDER SUMMARY */}
        <div className="lg:col-span-5">
          <Card className="sticky top-24 border-primary/20">
            <CardContent className="p-6 bg-surface-subtle rounded-2xl">
              <h3 className="text-lg font-display font-bold mb-4 border-b border-surface-border pb-4">Tvoja narudžbina</h3>
              
              <div className="flex flex-col gap-3 mb-6">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-text-secondary truncate pr-4">{item.quantity} x {item.name}</span>
                    <span className="font-medium shrink-0">{formatRSD(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-surface-border text-sm mb-6">
                 <div className="flex justify-between">
                    <span className="text-text-muted">Iznos (bez dostave)</span>
                    <span className="font-medium">{formatRSD(subtotal)}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-text-muted">Dostava</span>
                    <span className="font-medium">{shipping === 0 ? 'Besplatno' : formatRSD(shipping)}</span>
                 </div>
              </div>

              <div className="flex justify-between items-center mb-6 pt-4 border-t border-surface-border">
                <span className="font-bold text-lg">ZA PLAĆANJE</span>
                <span className="text-2xl font-display font-bold text-primary">{formatRSD(subtotal + shipping)}</span>
              </div>

              <Button 
                type="submit" 
                form="checkout-form" 
                variant="primary" 
                size="xl" 
                className="w-full"
                isLoading={isProcessing}
              >
                Potvrdi i plati
              </Button>
              <p className="text-xs text-center text-text-muted mt-4">
                 Klikom pristajete na Uvjete korišćenja. Transakcija je sigurna.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
