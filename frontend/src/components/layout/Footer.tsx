import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
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
