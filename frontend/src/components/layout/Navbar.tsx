import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, ChevronDown, User, LogOut } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCalcDropdownOpen, setIsCalcDropdownOpen] = useState(false);
  
  const { getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();
  const { user, logout, isAuthenticated } = useAuthStore();
  
  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home', 'Početna'), path: '/' },
    { name: t('nav.shop', 'Prodavnica'), path: '/shop' },
    { name: t('nav.about', 'O nama'), path: '/about' },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "backdrop-blur-xl bg-surface-card/80 border-b border-surface-border shadow-sm py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-text-primary">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl transition-transform group-hover:scale-110">⚡</span>
              <span className="font-display font-bold text-2xl text-primary">LumiSave</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  cn("font-medium hover:text-primary transition-colors", isActive && "text-primary font-bold")
                }
              >
                {t('nav.home', 'Početna')}
              </NavLink>

              {/* Dropdown for Calculators */}
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
                      className="absolute top-full left-0 w-48 bg-surface-card border border-surface-border rounded-lg shadow-lg overflow-hidden py-1"
                    >
                      <Link 
                        to="/calculator/led" 
                        className="block px-4 py-2 hover:bg-surface-subtle transition-colors"
                        onClick={() => setIsCalcDropdownOpen(false)}
                      >
                        LED Kalkulator
                      </Link>
                      <Link 
                        to="/calculator/smarthome" 
                        className="block px-4 py-2 hover:bg-surface-subtle transition-colors"
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
                  cn("font-medium hover:text-primary transition-colors", isActive && "text-primary font-bold")
                }
              >
                {t('nav.shop', 'Prodavnica')}
              </NavLink>

              <NavLink 
                to="/about" 
                className={({ isActive }) => 
                  cn("font-medium hover:text-primary transition-colors", isActive && "text-primary font-bold")
                }
              >
                {t('nav.about', 'O nama')}
              </NavLink>
            </div>

            {/* Right section: Theme, Lang, Cart, Auth */}
            <div className="hidden md:flex items-center space-x-4">
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
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 cursor-pointer border border-surface-border px-3 py-1.5 rounded-full hover:bg-surface-subtle transition-colors">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user?.firstName}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={logout} aria-label="Odjavi se">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Link to="/auth/login">
                  <Button variant="primary" size="sm">{t('nav.login', 'Prijava')}</Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-4">
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
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-surface-card z-50 p-6 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span className="font-display font-bold text-xl text-primary">LumiSave</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-text-muted hover:text-text-primary" />
                </button>
              </div>

              <div className="flex flex-col space-y-4">
                {navLinks.map(link => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    className="text-lg font-medium py-2 border-b border-surface-border text-text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <div className="py-2 border-b border-surface-border">
                  <span className="text-lg font-medium text-text-muted mb-2 block">{t('nav.calculators', 'Kalkulatori')}</span>
                  <div className="flex flex-col space-y-2 pl-4">
                    <Link to="/calculator/led" className="text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>LED Kalkulator</Link>
                    <Link to="/calculator/smarthome" className="text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>Smart Home Kalkulator</Link>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-4">
                <div className="flex items-center justify-between py-4 border-t border-surface-border">
                  <span className="font-medium text-text-primary">Tema</span>
                  <ThemeToggle />
                </div>
                
                {isAuthenticated ? (
                  <Button variant="danger" className="w-full" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                    Odjavi se
                  </Button>
                ) : (
                  <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">Prijavi se</Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
