import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, ChevronDown, User, LogOut, Package, Zap } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCalcDropdownOpen, setIsCalcDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const { getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();
  const { user, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore API errors on logout
    }
    logout();
    toast.success('Uspešno ste se odjavili.');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: t('nav.home', 'Početna'), path: '/' },
    { name: t('nav.shop', 'Prodavnica'), path: '/shop' },
    { name: t('nav.about', 'O nama'), path: '/about' },
  ];

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300',
          scrolled
            ? 'backdrop-blur-xl bg-surface-card/80 border-b border-surface-border shadow-sm py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-text-primary">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-xl text-primary">LumiSave</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn('font-medium hover:text-primary transition-colors', isActive && 'text-primary font-bold')
                }
              >
                {t('nav.home', 'Početna')}
              </NavLink>

              {/* Calculators dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsCalcDropdownOpen(true)}
                onMouseLeave={() => setIsCalcDropdownOpen(false)}
              >
                <button className="flex items-center gap-1 font-medium hover:text-primary transition-colors py-2">
                  {t('nav.calculators', 'Kalkulator')} <ChevronDown className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {isCalcDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 w-52 bg-surface-card border border-surface-border rounded-xl shadow-lg overflow-hidden py-1"
                    >
                      <Link
                        to="/calculator/led"
                        className="block px-4 py-2.5 hover:bg-surface-subtle transition-colors text-sm"
                        onClick={() => setIsCalcDropdownOpen(false)}
                      >
                        LED Kalkulator
                      </Link>
                      <Link
                        to="/calculator/smarthome"
                        className="block px-4 py-2.5 hover:bg-surface-subtle transition-colors text-sm"
                        onClick={() => setIsCalcDropdownOpen(false)}
                      >
                        Smart Home Kalkulator
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  cn('font-medium hover:text-primary transition-colors', isActive && 'text-primary font-bold')
                }
              >
                {t('nav.shop', 'Prodavnica')}
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  cn('font-medium hover:text-primary transition-colors', isActive && 'text-primary font-bold')
                }
              >
                {t('nav.about', 'O nama')}
              </NavLink>
            </div>

            {/* Right section */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <LanguageSwitcher />

              <Link to="/cart" className="relative group p-2">
                <ShoppingCart className="h-6 w-6 text-text-primary group-hover:text-primary transition-colors" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      key={cartItemCount}
                      className="absolute top-0 right-0 bg-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {isAuthenticated ? (
                <div
                  className="relative"
                  onMouseEnter={() => setIsUserDropdownOpen(true)}
                  onMouseLeave={() => setIsUserDropdownOpen(false)}
                >
                  <button className="flex items-center gap-2 border border-surface-border px-3 py-1.5 rounded-full hover:bg-surface-subtle transition-colors">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user?.firstName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                  </button>
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 w-52 bg-surface-card border border-surface-border rounded-xl shadow-lg overflow-hidden py-1 mt-1"
                      >
                        <div className="px-4 py-3 border-b border-surface-border">
                          <div className="text-sm font-semibold text-text-primary">{user?.firstName} {user?.lastName}</div>
                          <div className="text-xs text-text-muted">{user?.email}</div>
                        </div>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface-subtle transition-colors text-sm"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <Package className="w-4 h-4 text-text-muted" />
                          Moje narudžbine
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface-subtle transition-colors text-sm"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <User className="w-4 h-4 text-text-muted" />
                            Admin panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 hover:text-red-600 transition-colors text-sm text-text-secondary border-t border-surface-border mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Odjavi se
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/auth/login">
                    <Button variant="ghost" size="sm">{t('nav.login', 'Prijava')}</Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button variant="primary" size="sm">Registruj se</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile nav right */}
            <div className="md:hidden flex items-center gap-3">
              <Link to="/cart" className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <button
                className="text-text-primary focus:outline-none"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-surface-card z-50 p-6 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-display font-bold text-xl text-primary">LumiSave</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-text-muted hover:text-text-primary" />
                </button>
              </div>

              <div className="flex flex-col space-y-1 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-base font-medium py-3 px-3 rounded-xl text-text-primary hover:bg-surface-subtle transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="py-1">
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 mb-2 mt-2">Kalkulatori</div>
                  <Link to="/calculator/led" className="block px-3 py-2.5 rounded-xl text-text-primary text-sm hover:bg-surface-subtle transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    LED Kalkulator
                  </Link>
                  <Link to="/calculator/smarthome" className="block px-3 py-2.5 rounded-xl text-text-primary text-sm hover:bg-surface-subtle transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Smart Home Kalkulator
                  </Link>
                </div>

                {isAuthenticated && (
                  <Link
                    to="/orders"
                    className="flex items-center gap-2 px-3 py-3 rounded-xl text-text-primary hover:bg-surface-subtle transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Package className="w-4 h-4 text-text-muted" />
                    Moje narudžbine
                  </Link>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-surface-border">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary text-sm">Tema</span>
                  <ThemeToggle />
                </div>

                {isAuthenticated ? (
                  <Button variant="danger" className="w-full" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Odjavi se
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full">Prijavi se</Button>
                    </Link>
                    <Link to="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full">Registruj se</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
