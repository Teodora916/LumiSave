import React, { useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
    }
  }, [sessionId, navigate]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <Card className="border-accent border-2 shadow-glow-lg overflow-hidden relative">
        {/* Decorative background circle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl -z-10" />
        
        <CardContent className="px-6 py-16 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-accent" />
          </motion.div>
          
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 text-text-primary">
            Uspešna kupovina!
          </h1>
          <p className="text-lg text-text-muted mb-2">
            Hvala vam na poverenju. Vaša narudžbina je uspešno zabeležena.
          </p>
          <p className="text-sm font-mono bg-surface-subtle px-4 py-2 rounded-lg text-text-secondary mb-10">
            ID Narudžbine: {sessionId || 'N/A'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link to="/admin/orders" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full" leftIcon={<ShoppingBag className="w-5 h-5"/>}>
                Moje narudžbine
              </Button>
            </Link>
            <Link to="/shop" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-5 h-5"/>}>
                Nastavi kupovinu
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Fallback mock motion import error if not imported correctly */}
    </div>
  );
};

// Minimal mock motion to prevent missing imports if I forgot it
import { motion } from 'framer-motion';
