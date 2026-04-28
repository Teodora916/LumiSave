import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { UserPlus, Zap, Eye, EyeOff, Check, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser } from '@/stores/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Ime mora imati bar 2 karaktera'),
  lastName: z.string().min(2, 'Prezime mora imati bar 2 karaktera'),
  email: z.string().email('Unesite validnu email adresu'),
  password: z
    .string()
    .min(8, 'Lozinka mora imati bar 8 karaktera')
    .regex(/[A-Z]/, 'Mora sadržati bar jedno veliko slovo')
    .regex(/[0-9]/, 'Mora sadržati bar jedan broj')
    .regex(/[^a-zA-Z0-9]/, 'Mora sadržati bar jedan specijalni karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Lozinke se ne podudaraju',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 1) return { score, label: 'Slaba', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Srednja', color: 'bg-orange-400' };
  if (score <= 3) return { score, label: 'Dobra', color: 'bg-yellow-400' };
  return { score, label: 'Jaka', color: 'bg-accent' };
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch('password', '');
  const strength = getPasswordStrength(watchedPassword);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      const user: AuthUser = {
        id: response.userId,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role as 'CUSTOMER' | 'ADMIN',
      };

      login(user, response.accessToken, response.refreshToken);
      toast.success(`Dobrodošli, ${response.firstName}! Nalog je uspešno kreiran.`);
      navigate('/', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registracija nije uspela.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'Pun pristup LED i Smart Home kalkulatorima',
    'Ekskluzivne cene u prodavnici',
    'Praćenje istorije narudžbina',
    'Personalizovane preporuke uštede',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0A120E] via-[#1A6B3A] to-[#0A120E] flex-col justify-between p-12 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-light/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <span className="font-display font-bold text-2xl text-white">LumiSave</span>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Leaf className="w-5 h-5 text-accent" />
            <span className="text-accent text-sm font-semibold tracking-wide uppercase">Registracija</span>
          </div>
          <h2 className="text-4xl font-display font-bold text-white leading-tight mb-6">
            Počnite da štedite<br /><span className="text-accent">od prvog dana</span>
          </h2>
          <p className="text-white/70 mb-8">
            Kreirajte besplatan nalog i otkrijte koliko novca možete da uštedite.
          </p>

          <div className="flex flex-col gap-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="text-white/80 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 bg-surface-bg overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-primary">LumiSave</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
              Kreirajte nalog
            </h1>
            <p className="text-text-muted">
              Već imate nalog?{' '}
              <Link to="/auth/login" className="text-primary font-semibold hover:underline">
                Prijavite se
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">Ime</label>
                <Input
                  placeholder="Marko"
                  {...register('firstName')}
                  error={!!errors.firstName}
                  className="h-11"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">Prezime</label>
                <Input
                  placeholder="Petrović"
                  {...register('lastName')}
                  error={!!errors.lastName}
                  className="h-11"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">Email adresa</label>
              <Input
                type="email"
                placeholder="primer@gmail.com"
                {...register('email')}
                error={!!errors.email}
                className="h-11"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">Lozinka</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 karaktera"
                  {...register('password')}
                  error={!!errors.password}
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}

              {/* Password strength meter */}
              {watchedPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-all duration-300',
                          i <= Math.floor((strength.score / 5) * 4)
                            ? strength.color
                            : 'bg-surface-border'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-muted">
                    Jačina lozinke: <span className="font-medium text-text-primary">{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">Potvrdi lozinku</label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Ponovite lozinku"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 text-base mt-2"
              isLoading={isLoading}
              leftIcon={!isLoading ? <UserPlus className="w-4 h-4" /> : undefined}
            >
              Kreiraj nalog
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-border text-center">
            <p className="text-xs text-text-muted">
              Registracijom prihvatate naše{' '}
              <Link to="/terms" className="text-primary hover:underline">Uslove korišćenja</Link>
              {' '}i{' '}
              <Link to="/privacy" className="text-primary hover:underline">Politiku privatnosti</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
