import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, Zap, LineChart, Award, Users, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CountUpNumber } from '@/components/ui/CountUpNumber';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1 },
  }),
};

export const AboutPage: React.FC = () => {
  const values = [
    {
      icon: <Zap className="w-7 h-7 text-accent" />,
      title: 'Efikasnost',
      description: 'Svako rešenje koje nudimo prolazi kroz rigoroznu analizu isplativosti i energetskog uticaja.',
    },
    {
      icon: <Leaf className="w-7 h-7 text-primary" />,
      title: 'Održivost',
      description: 'Naš cilj je smanjenje ugljičnog otiska domaćinstava u Srbiji za 30% do 2030. godine.',
    },
    {
      icon: <Award className="w-7 h-7 text-accent-warm" />,
      title: 'Transparentnost',
      description: 'Svi kalkulatori koriste realne cene električne energije i verifikovane tehničke podatke.',
    },
    {
      icon: <Users className="w-7 h-7 text-primary" />,
      title: 'Zajednica',
      description: 'Gradimo platformu za deljenje znanja o energetskoj efikasnosti između korisnika.',
    },
  ];

  const team = [
    { name: 'Aleksa Marković', role: 'Osnivač & CEO', avatar: 'AM' },
    { name: 'Jovana Stanić', role: 'Head of Product', avatar: 'JS' },
    { name: 'Miloš Đorđević', role: 'Lead Engineer', avatar: 'MD' },
  ];

  const milestones = [
    { year: '2023', text: 'Osnivanje LumiSave-a i lansiranje beta verzije kalkulatora.' },
    { year: '2024', text: 'Prelazio 10.000 korisnika i pokretanje prodavnice LED komponenti.' },
    { year: '2025', text: 'Smart Home integracija, Stripe plaćanje, i rast na 15.000+ korisnika.' },
    { year: '2026', text: 'Ekspanzija na region — cilj: 50.000 domaćinstava do kraja godine.' },
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-[#0A120E] via-[#1A3A22] to-[#0A120E] text-white py-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-light/20 rounded-full blur-[100px]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <Globe className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">O nama</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold leading-[1.1] mb-6"
          >
            Misija koja<br />
            <span className="text-accent">štedi planetu</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            LumiSave je nastao iz jednostavne ideje — svako domaćinstvo u Srbiji može da smanji račun za struju za najmanje 40%, samo uz prave informacije i pristup efikasnom hardveru.
          </motion.p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-surface-card border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-surface-border">
            {[
              { value: 15300, label: 'Aktivnih korisnika', suffix: '+' },
              { value: 8.5, label: 'Mio. kWh uštede', suffix: 'M', decimals: 1 },
              { value: 120, label: 'Mio. RSD uštedeno', suffix: 'M+' },
              { value: 4200, label: 'Tona CO₂ manje', suffix: 't' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center px-4"
              >
                <div className="text-4xl md:text-5xl font-mono font-bold text-primary mb-2">
                  <CountUpNumber value={stat.value} decimals={stat.decimals} />{stat.suffix}
                </div>
                <div className="text-text-muted font-medium text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-24 bg-surface-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <LineChart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Naša priča</span>
              </div>
              <h2 className="text-4xl font-display font-bold text-text-primary mb-6 leading-tight">
                Počelo je iz frustracije<br />zbog visokih računa
              </h2>
              <div className="space-y-4 text-text-secondary text-lg leading-relaxed">
                <p>
                  Osnivači LumiSave-a su 2023. shvatili da prosečna srpska porodica plaća FAR više nego što mora — jednostavno zbog nedostatka informacija o efikasnijem osvetljenju i pametnim uređajima.
                </p>
                <p>
                  Napravili smo najprecizniji kalkulator za LED zamenu i Smart Home analizu u regionu, a zatim dodali i prodavnicu odobrenih, matematički optimizovanih uređaja.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                {[
                  'Besplatni kalkulatori dostupni svima',
                  'Provjereni podaci o cenama električne energije',
                  'Direktna veza između analize i kupovine',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span className="text-text-secondary">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-transparent" />
              <div className="flex flex-col gap-8">
                {milestones.map((m, i) => (
                  <div key={m.year} className="pl-12 relative">
                    <div className="absolute left-0 top-0.5 w-8 h-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                    <div className="text-xs font-bold text-accent mb-1 tracking-wider">{m.year}</div>
                    <p className="text-text-secondary">{m.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 bg-surface-subtle border-y border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-text-primary mb-4">Naše vrednosti</h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Principi koji vode svaku odluku u LumiSave-u.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="h-full hover:-translate-y-1 transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-surface-subtle rounded-2xl flex items-center justify-center mb-4 border border-surface-border">
                      {v.icon}
                    </div>
                    <h3 className="text-lg font-display font-bold text-text-primary mb-2">{v.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{v.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-24 bg-surface-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-text-primary mb-4">Tim iza LumiSave-a</h2>
            <p className="text-xl text-text-muted max-w-xl mx-auto">
              Mala, posvećena ekipa sa jednom misijom — učiniti energetsku efikasnost dostupnom svima.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="text-center hover:-translate-y-1 transition-transform duration-300">
                  <CardContent className="p-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{member.avatar}</span>
                    </div>
                    <h3 className="font-display font-bold text-text-primary text-lg">{member.name}</h3>
                    <p className="text-text-muted text-sm mt-1">{member.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-primary py-20 text-white">
        <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-primary-light to-transparent opacity-50" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Pridružite nam se danas
          </h2>
          <p className="text-xl opacity-90 mb-10">
            Počnite sa besplatnim kalkulatorom i otkrijte koliko možete uštedeti.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/calculator/led">
              <Button size="xl" className="bg-white text-primary hover:bg-surface-bg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Pokreni kalkulator
              </Button>
            </Link>
            <Link to="/shop">
              <Button size="xl" className="border-2 border-white/40 bg-transparent text-white hover:bg-white/10">
                Istražite prodavnicu
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
