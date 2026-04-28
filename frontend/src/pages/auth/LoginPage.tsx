import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { LogIn, Zap, Eye, EyeOff, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser } from '@/stores/authStore';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Unesite validnu email adresu'),
  password: z.string().min(1, 'Unesite lozinku'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const nextPath = new URLSearchParams(location.search).get('next') ?? '/';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email: data.email, password: data.password });

      const user: AuthUser = {
        id: response.userId,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role as 'CUSTOMER' | 'ADMIN',
      };

      login(user, response.accessToken, response.refreshToken);
      toast.success(`Dobrodošli, ${response.firstName}!`);
      navigate(nextPath, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Prijavljivanje nije uspelo.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0A120E] via-[#1A6B3A] to-[#0A120E] flex-col justify-between p-12 overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-light/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <span className="font-display font-bold text-2xl text-white">LumiSave</span>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Leaf className="w-5 h-5 text-accent" />
            <span className="text-accent text-sm font-semibold tracking-wide uppercase">Energetska efikasnost</span>
          </div>
          <h2 className="text-4xl font-display font-bold text-white leading-tight mb-6">
            Uštedite do <span className="text-accent">80%</span><br />na računu za struju
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Prijavite se i pristupite kalkulatorima, personalizovanim preporukama i ekskluzivnim cenama.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-10">
            {[
              { value: '15.300', label: 'Aktivnih korisnika' },
              { value: '8,5M+', label: 'kWh uštede' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-bold font-mono text-white">{stat.value}</div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 bg-surface-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
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
              Dobrodošli nazad
            </h1>
            <p className="text-text-muted">
              Nemate nalog?{' '}
              <Link to="/auth/register" className="text-primary font-semibold hover:underline">
                Registrujte se
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Email adresa
              </label>
              <Input
                type="email"
                placeholder="primer@gmail.com"
                {...register('email')}
                error={!!errors.email}
                className="h-12"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-text-primary">Lozinka</label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                >
                  Zaboravili ste lozinku?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  error={!!errors.password}
                  className="h-12 pr-11"
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
                <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 text-base"
              isLoading={isLoading}
              leftIcon={!isLoading ? <LogIn className="w-4 h-4" /> : undefined}
            >
              Prijavi se
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-surface-border text-center">
            <p className="text-xs text-text-muted">
              Prijavom prihvatate naše{' '}
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
