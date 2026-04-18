import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-surface-card border-t border-surface-border pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Column 1: Brand & Social */}
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center gap-2 group w-max">
              <span className="text-2xl transition-transform group-hover:scale-110">⚡</span>
              <span className="font-display font-bold text-2xl text-primary">LumiSave</span>
            </Link>
            <p className="text-text-muted mt-4 max-w-sm">
              Inovativno rešenje za optimizaciju kućnog budžeta i prelazak na energetski efikasne tehnologije.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-border transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-border transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-border transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-border transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-display font-bold text-lg text-text-primary mb-2">Brzi linkovi</h4>
            <Link to="/calculator/led" className="text-text-secondary hover:text-primary transition-colors w-max">LED Kalkulator</Link>
            <Link to="/calculator/smarthome" className="text-text-secondary hover:text-primary transition-colors w-max">Smart Home Analiza</Link>
            <Link to="/shop" className="text-text-secondary hover:text-primary transition-colors w-max">Prodavnica</Link>
            <Link to="/about" className="text-text-secondary hover:text-primary transition-colors w-max">O nama</Link>
            <Link to="/faq" className="text-text-secondary hover:text-primary transition-colors w-max">Česta pitanja</Link>
          </div>

          {/* Column 3: Newsletter */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-display font-bold text-lg text-text-primary mb-2">Prijavite se na newsletter</h4>
            <p className="text-text-muted text-sm">
              Budite u toku sa najnovijim ponudama LED sijalica i savetima za uštedu.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 mt-2" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-grow">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input type="email" placeholder="Vaša email adresa" className="pl-10" required />
              </div>
              <Button type="submit" variant="primary">Prijavi se</Button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} LumiSave. Sva prava zadržana.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">Politika privatnosti</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Uslovi korišćenja</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
