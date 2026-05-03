import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { formatRSD } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ordersApi } from '@/api/orders';
import { cartApi } from '@/api/cart';
import { toast } from 'sonner';

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

type Step = 'idle' | 'syncing_cart' | 'creating_session' | 'redirecting';

function stepLabel(step: Step): string {
  switch (step) {
    case 'syncing_cart':    return 'Sinhronizacija korpe...';
    case 'creating_session': return 'Kreiranje narudžbine...';
    case 'redirecting':     return 'Preusmeravanje na Stripe...';
    default:                return 'Nastavi na bezbedno plaćanje';
  }
}

export const CheckoutPage: React.FC = () => {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('idle');

  const subtotal = getSubtotal();
  const shipping = subtotal > 5000 ? 0 : 490;

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: 'Srbija',
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    setStep('syncing_cart');
    try {
      // ── Step 1: Sync local Zustand cart → server cart ───────────────────────
      // Clear the server cart first, then re-add every item from the local store.
      // This ensures the backend cart exactly mirrors what the user sees.
      await cartApi.clearCart();

      for (const item of items) {
        await cartApi.addItem({
          ProductId: item.productId,
          Quantity: item.quantity,
        });
      }

      // ── Step 2: Create Stripe checkout session ───────────────────────────────
      setStep('creating_session');
      const result = await ordersApi.createCheckoutSession({
        shippingFirstName: data.firstName,
        shippingLastName: data.lastName,
        shippingPhone: data.phone,
        shippingAddress: data.address,
        shippingCity: data.city,
        shippingPostalCode: data.postalCode,
        shippingCountry: data.country,
      });

      // ── Step 3: Clear local cart and redirect ────────────────────────────────
      setStep('redirecting');
      clearCart();
      window.location.href = result.sessionUrl;

    } catch (err) {
      // Toast is shown by api/client.ts interceptor; just reset state here.
      const message = err instanceof Error ? err.message : 'Greška pri kreiranju narudžbine.';
      // Only show toast if client interceptor didn't already (e.g. for network errors)
      if (message.startsWith('API Error') === false) {
        toast.error(message);
      }
      setStep('idle');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Vaša korpa je prazna</h1>
        <Button onClick={() => navigate('/shop')}>Vrati se u prodavnicu</Button>
      </div>
    );
  }

  const isProcessing = step !== 'idle';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

      {/* Checkout Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">1</div>
          <span className="text-sm font-medium hidden sm:block">Dostava</span>
          <div className="w-12 sm:w-24 border-t-2 border-surface-border mx-2"></div>

          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-sm transition-colors ${
            isProcessing ? 'border-primary text-primary' : 'border-surface-border text-surface-border'
          }`}>
            {step === 'creating_session' || step === 'redirecting'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : '2'
            }
          </div>
          <span className="text-sm font-medium text-text-muted hidden sm:block">Plaćanje (Stripe)</span>
          <div className="w-12 sm:w-24 border-t-2 border-surface-border mx-2 border-dashed"></div>

          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-surface-border text-surface-border font-bold text-sm">3</div>
          <span className="text-sm font-medium text-text-muted hidden sm:block">Potvrda</span>
        </div>
      </div>

      {/* Cart sync progress banner */}
      {step === 'syncing_cart' && (
        <div className="mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 text-sm text-primary font-medium">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          Sinhronizacija vaše korpe sa serverom ({items.length} {items.length === 1 ? 'artikal' : 'artikla'})...
        </div>
      )}

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

          <div className="mt-4 p-4 bg-surface-subtle rounded-xl border border-surface-border flex items-start gap-3 text-sm text-text-muted">
            <Lock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span>
              Plaćanje se obavlja na sigurnoj Stripe stranici. Vaši podaci su zaštićeni SSL/TLS enkripcijom.
              Podaci kartice se ne čuvaju na našim serverima.
            </span>
          </div>
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
                  <span className={shipping === 0 ? 'font-bold text-accent' : 'font-medium'}>
                    {shipping === 0 ? 'Besplatno' : formatRSD(shipping)}
                  </span>
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
                leftIcon={!isProcessing ? <ShieldCheck className="w-5 h-5" /> : undefined}
              >
                {isProcessing ? stepLabel(step) : 'Nastavi na bezbedno plaćanje'}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <Lock className="w-3.5 h-3.5 text-text-muted" />
                <p className="text-xs text-center text-text-muted">
                  Sigurno plaćanje putem Stripe-a
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
