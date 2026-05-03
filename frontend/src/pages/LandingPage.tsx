import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb, Zap, LineChart, ChevronDown, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CountUpNumber } from '@/components/ui/CountUpNumber';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse-ring" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[80px]" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/2 w-[600px] h-[600px] bg-primary-light/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-subtle border border-surface-border mb-6"
            >
              <Leaf className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-text-primary">{t('hero.badge')}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-bold text-text-primary leading-[1.1] mb-6"
            >
              {t('hero.title_part1')} <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">80%</span><br />
              {t('hero.title_part2')}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link to="/calculator/led" className="w-full sm:w-auto">
                <Button size="xl" variant="primary" className="w-full" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  {t('hero.cta_calc')}
                </Button>
              </Link>
              <Link to="/shop" className="w-full sm:w-auto">
                <Button size="xl" variant="secondary" className="w-full">
                  {t('hero.cta_shop')}
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Stats & Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex-1 w-full max-w-lg relative"
          >
            <div className="bg-surface-card/80 backdrop-blur-xl border border-surface-border rounded-2xl p-6 shadow-xl relative z-10 animate-slide-up">
              <h3 className="font-display font-semibold mb-6 flex justify-between items-center text-text-primary">
                <span>Dnevna ušteda u realnom vremenu</span>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                </span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-subtle p-4 rounded-xl border border-surface-border">
                  <div className="text-sm text-text-muted mb-1">Ukupno korisnika</div>
                  <div className="text-2xl font-bold font-mono text-primary">
                    <CountUpNumber value={12400} />
                  </div>
                </div>
                <div className="bg-surface-subtle p-4 rounded-xl border border-surface-border">
                  <div className="text-sm text-text-muted mb-1">Uštedeno kWh</div>
                  <div className="text-2xl font-bold font-mono text-accent">
                    <CountUpNumber value={2400000} format="kwh" />
                  </div>
                </div>
              </div>

              <div className="h-2 bg-surface-border rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ delay: 0.8, duration: 1.5 }}
                  className="h-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
              <div className="mt-2 text-right text-sm font-medium text-text-secondary">
                Prosečna ušteda iznosi <CountUpNumber value={80} format="percent" />
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-accent-warm to-accent rounded-2xl rotate-12 blur-sm opacity-50 -z-10" />
            <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-primary-light rounded-full blur-xl opacity-30 -z-10" />
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
          <ChevronDown className="w-8 h-8 text-primary" />
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section className="py-24 bg-surface-bg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-text-primary mb-4">Sve što vam je potrebno na jednom mestu</h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">Prelazak na efikasniju potrošnju energije nikada nije bio lakši. Pratite, analizirajte i unapredite svoj dom.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
              <Card className="h-full hover:-translate-y-2 transition-transform duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-surface-subtle rounded-2xl flex items-center justify-center mb-4">
                    <Lightbulb className="w-8 h-8 text-accent" />
                  </div>
                  <CardTitle>Precizan Kalkulator</CardTitle>
                  <CardDescription className="text-base mt-2">Unesite trenutne uređaje i odmah saznajte koliko novca rasipate, i koji je period povrata investicije.</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } } }}>
              <Card className="h-full hover:-translate-y-2 transition-transform duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-surface-subtle rounded-2xl flex items-center justify-center mb-4">
                    <LineChart className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Smart Home Analiza</CardTitle>
                  <CardDescription className="text-base mt-2">Istražite uticaj "vampire power" uređaja, pametnih termostata i solarnih panela na vaš energetski skor.</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } } }}>
              <Card className="h-full hover:-translate-y-2 transition-transform duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-surface-subtle rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-accent-warm" />
                  </div>
                  <CardTitle>Integrisana Prodavnica</CardTitle>
                  <CardDescription className="text-base mt-2">Kupite preporučene uređaje koji su vam matematički optimizovani po isplativosti na jednoj platformi.</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS TIMELINE */}
      <section className="py-24 bg-surface-subtle border-y border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-text-primary mb-4">Kako funkcioniše?</h2>
            <p className="text-xl text-text-muted">Proces optimizacije do ostvarivanja uštede u 4 laka koraka.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start relative pb-10">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-[28px] left-[50px] right-[50px] h-1 bg-surface-border rounded-full z-0">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full bg-primary rounded-full" 
              />
            </div>

            {[
              { id: 1, title: 'Unesi podatke', desc: 'Dodajte prostore i aparate.' },
              { id: 2, title: 'Dobij analizu', desc: 'Naš algoritam računa profit.' },
              { id: 3, title: 'Vidi preporuke', desc: 'Najbolje izabran hardver.' },
              { id: 4, title: 'Uštedi na računu', desc: 'Trajno smanjenje troškova.' }
            ].map((step, idx) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center w-full md:w-1/4 mb-8 md:mb-0"
              >
                <div className="w-14 h-14 bg-surface-bg border-4 border-surface-subtle rounded-full flex items-center justify-center font-bold text-xl text-primary shadow-sm mb-4">
                  {step.id}
                </div>
                <h4 className="text-lg font-bold text-text-primary mb-2">{step.title}</h4>
                <p className="text-text-muted text-sm px-4">{step.desc}</p>
                
                {/* Mobile vertical line */}
                {idx < 3 && (
                  <div className="block md:hidden w-1 h-12 bg-primary my-2 rounded-full" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. STATS SECTION */}
      <section className="py-24 bg-surface-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-surface-border">
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-mono font-bold text-primary mb-2">
                <CountUpNumber value={8.5} decimals={1} />M+
              </div>
              <div className="text-text-muted font-medium">Ušteđenih kWh struje</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-mono font-bold text-accent mb-2">
                <CountUpNumber value={120} />M+
              </div>
              <div className="text-text-muted font-medium">Sačuvanih Dinara</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-mono font-bold text-text-primary mb-2">
                <CountUpNumber value={15300} />
              </div>
              <div className="text-text-muted font-medium">Aktivnih Korisnika</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-mono font-bold text-emerald-500 mb-2">
                <CountUpNumber value={4200} />t
              </div>
              <div className="text-text-muted font-medium">Smanjenje CO₂ emisija</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="relative overflow-hidden bg-primary py-20 text-white">
        {/* Background glow effects built with standard Tailwind gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-full bg-gradient-to-l from-primary-light to-transparent opacity-50" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Ne bacajte vaš novac!</h2>
          <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-2xl mx-auto font-medium">
            Započnite besplatnu analizu danas i saznajte koliko biste mogli da uštedite ulaganjem u pametne tehnologije.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/calculator/led">
              <Button size="xl" className="w-full sm:w-auto bg-white text-primary hover:bg-surface-bg hover:scale-105" leftIcon={<LineChart className="w-5 h-5"/>}>
                Pokrenite Kalkulator
              </Button>
            </Link>
            <span className="text-sm opacity-80 mx-2">ili</span>
            <Link to="/shop" className="text-white underline hover:no-underline font-medium hover:text-accent-glow transition-colors">
              Istražite katalog
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
