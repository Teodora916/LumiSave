import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Zap, Plug, Thermometer, Lightbulb, Sun, LineChart } from 'lucide-react';
import { CountUpNumber } from '@/components/ui/CountUpNumber';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/RangeSlider';

export const SmartHomeCalculatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('vampire');
  const [score, setScore] = useState(65);
  
  // Dummy states for example logic
  const [smartPlugCount, setSmartPlugCount] = useState(0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 1. HERO - Score */}
      <section className="bg-surface-card rounded-2xl p-6 md:p-10 mb-8 border border-surface-border shadow-sm flex flex-col md:flex-row items-center gap-8 md:gap-12 sticky top-24 z-10">
        <ScoreRing score={score} size={140} animated={true} />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Vaš Smart Home Score</h1>
          <p className="text-text-muted mb-4 max-w-lg">
            {score < 70 
              ? 'Imate veliki potencijal za poboljšanje! Upravljanje potrošnjom u stanju mirovanja i grejanjem može značajno popraviti vaš skor.'
              : 'Odličan rezultat! Vaš dom je energetski optimizovan.'}
          </p>
          <div className="flex gap-4 items-center justify-center md:justify-start">
            <div className="flex flex-col items-center">
              <span className="text-xs text-text-muted">Vampire Power</span>
              <div className="w-16 h-1.5 bg-surface-border rounded-full mt-1 overflow-hidden">
                <div className="w-1/3 h-full bg-red-400" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-text-muted">Grejanje</span>
              <div className="w-16 h-1.5 bg-surface-border rounded-full mt-1 overflow-hidden">
                <div className="w-3/4 h-full bg-amber-400" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-text-muted">Rasveta</span>
              <div className="w-16 h-1.5 bg-surface-border rounded-full mt-1 overflow-hidden">
                <div className="w-full h-full bg-accent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row gap-8">
        
        <TabsList className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 w-full md:w-64 shrink-0">
          {[
            { id: 'vampire', label: 'Vampire Power', icon: <Zap className="w-5 h-5"/> },
            { id: 'smartplugs', label: 'Smart Plugs', icon: <Plug className="w-5 h-5"/> },
            { id: 'thermostat', label: 'Grejanje (Termostat)', icon: <Thermometer className="w-5 h-5"/> },
            { id: 'lighting', label: 'Automatska Rasveta', icon: <Lightbulb className="w-5 h-5"/> },
            { id: 'solar', label: 'Solarni potencijal', icon: <Sun className="w-5 h-5"/> },
            { id: 'results', label: 'Zbirni Rezultati', icon: <LineChart className="w-5 h-5"/> },
          ].map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap outline-none
                ${activeTab === tab.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-surface-card text-text-secondary hover:bg-surface-subtle border border-surface-border'
                }`}
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1">
          {/* VAMPIRE POWER TAB MOCK */}
          <TabsContent value="vampire" className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2"><Zap className="text-accent" /> Vampire Power (Standby)</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-text-muted mb-6">Mnogi uređaji troše struju čak i kada su isključeni, ali su uključeni u utičnicu. Izaberite uređaje koje imate u kući.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {['TV', 'Konzola', 'Punjači', 'Mikrotalasna', 'PC'].map(device => (
                    <div key={device} className="border border-surface-border rounded-xl p-4 flex flex-col items-center text-center hover:border-primary cursor-pointer transition-colors bg-surface-subtle">
                      <div className="w-12 h-12 bg-surface-card rounded-full flex items-center justify-center mb-2 shadow-sm font-bold text-lg">{device[0]}</div>
                      <span className="font-medium text-sm">{device}</span>
                      <span className="text-xs text-red-400 mt-1">~5W/h standby</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMART PLUGS TAB MOCK */}
          <TabsContent value="smartplugs" className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-display font-semibold mb-6">Smart Plugs Ušteda</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-text-muted mb-4">Ugasite 'vampire' uređaje poptuno noću koristeći pametne utičnice.</p>
                <div className="mb-6">
                  <label className="block mb-2 font-medium">Broj Smart Utičnica: {smartPlugCount}</label>
                  <RangeSlider min={0} max={20} value={smartPlugCount} onChange={setSmartPlugCount} />
                </div>
                {smartPlugCount > 0 && (
                  <div className="bg-surface-subtle border border-surface-border p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-sm text-text-muted">Potencijalna mesečna ušteda</div>
                      <div className="text-2xl font-bold text-accent"><CountUpNumber value={smartPlugCount * 120} /> RSD</div>
                    </div>
                    <Button variant="primary" size="sm">Dodaj u korpu kom. {smartPlugCount}</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SOLAR TAB MOCK */}
          <TabsContent value="solar" className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2"><Sun className="text-amber-500"/> Solarni Potencijal</h2>
            <Card>
              <CardContent className="p-6 text-center py-12">
                <Sun className="w-16 h-16 text-amber-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Simulacija solarnih panela</h3>
                <p className="text-text-muted mb-6">Napredni solarni ROI kalkulator...</p>
                <Button variant="secondary">Procenite potencijal krova</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OTHER TABS */}
          <TabsContent value="thermostat">
             <Card><CardContent className="p-6">Termostat i grejanje forma bi ovde bila implementirana.</CardContent></Card>
          </TabsContent>
          <TabsContent value="lighting">
             <Card><CardContent className="p-6">Senzori pokreta i dimeri.</CardContent></Card>
          </TabsContent>
          <TabsContent value="results">
             <Card><CardContent className="p-6 text-center">Zbirni dashboard bi generisao i izvezao PDF ovde.</CardContent></Card>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
};
