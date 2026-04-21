import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Zap, LineChart, Leaf, Clock, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/Select';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { CountUpNumber } from '@/components/ui/CountUpNumber';
import { useCalculatorStore } from '@/stores/calculatorStore';
import type { LightingGroupInput, BulbType } from '@/stores/calculatorStore';
import { calculateLedSavings } from '@/services/calculatorService';
import type { LedCalculationResult } from '@/services/calculatorService';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, LineChart as RCLineChart, Line, ReferenceLine, ReferenceArea } from 'recharts';

export const LEDCalculatorPage: React.FC = () => {
  const { 
    electricityPrice, setElectricityPrice, 
    lightingGroups, addLightingGroup, updateLightingGroup, removeLightingGroup,
    ledResult, setLedResult
  } = useCalculatorStore();

  const calculateMutation = useMutation({
    mutationFn: calculateLedSavings,
    onSuccess: (data) => {
      setLedResult(data);
    }
  });

  const handleCalculate = () => {
    calculateMutation.mutate({
      electricityPrice,
      rooms: lightingGroups
    });
  };

  const handleAddRoom = () => {
    addLightingGroup({
      id: Date.now().toString(),
      roomName: '',
      bulbType: 'Incandescent',
      wattageOld: 60,
      bulbCount: 1,
      dailyUsageHours: 4,
    });
  };

  const bulbTypes = [
    { value: 'Incandescent', label: 'Klasična (Volfram)' },
    { value: 'Halogen', label: 'Halogena sijalica' },
    { value: 'CFL', label: 'Štedljiva (CFL)' },
  ];

  const wattageOptions = [
    { value: '25', label: '25W' },
    { value: '40', label: '40W' },
    { value: '60', label: '60W' },
    { value: '75', label: '75W' },
    { value: '100', label: '100W' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-2">LED Kalkulator Uštede</h1>
        <p className="text-text-muted">Proverite koliko novca možete uštedeti prelaskom na LED rasvetu.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8">
        
        {/* LEFT PANEL - INPUTS */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-accent"/> Cena struje</CardTitle>
              <CardDescription>Unesite prosečnu cenu po kilovat-satu u vašoj tarifi.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input 
                  type="number" 
                  value={electricityPrice} 
                  onChange={(e) => setElectricityPrice(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-text-muted font-medium">RSD/kWh</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold">🏠 Vaše trenutno osvetljenje</h2>
            <Button variant="secondary" size="sm" onClick={handleAddRoom} leftIcon={<Plus className="w-4 h-4"/>}>
              Dodaj sobu
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {lightingGroups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="border border-surface-border bg-surface-card">
                    <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                      <button 
                        onClick={() => removeLightingGroup(group.id)}
                        className="absolute top-4 right-4 text-text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div>
                        <label className="text-xs font-semibold text-text-muted mb-1 block">Naziv sobe/grupe</label>
                        <Input 
                          placeholder="Npr. Dnevna soba" 
                          value={group.roomName} 
                          onChange={(e) => updateLightingGroup(group.id, { roomName: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-text-muted mb-1 block">Tip sijalice</label>
                        <Select 
                          options={bulbTypes} 
                          value={group.bulbType} 
                          onChange={(v) => updateLightingGroup(group.id, { bulbType: v as BulbType })}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-text-muted mb-1 block">Snaga (W)</label>
                        <Select 
                          options={wattageOptions} 
                          value={group.wattageOld.toString()} 
                          onChange={(v) => updateLightingGroup(group.id, { wattageOld: Number(v) })}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-text-muted mb-1 block">Broj sijalica</label>
                        <div className="flex items-center">
                          <Button variant="secondary" size="icon" className="h-10 rounded-r-none border-r-0"
                            onClick={() => updateLightingGroup(group.id, { bulbCount: Math.max(1, group.bulbCount - 1) })}>-</Button>
                          <Input 
                            type="number" 
                            className="h-10 rounded-none text-center border-x-0" 
                            value={group.bulbCount} 
                            readOnly
                          />
                          <Button variant="secondary" size="icon" className="h-10 rounded-l-none border-l-0"
                            onClick={() => updateLightingGroup(group.id, { bulbCount: Math.min(100, group.bulbCount + 1) })}>+</Button>
                        </div>
                      </div>

                      <div className="sm:col-span-2 mt-2">
                        <label className="text-xs font-semibold text-text-muted mb-3 flex justify-between">
                          <span>Dnevno korišćenje</span>
                          <span className="text-primary font-bold">{group.dailyUsageHours} h</span>
                        </label>
                        <RangeSlider 
                          min={0.5} max={24} step={0.5} 
                          value={group.dailyUsageHours} 
                          onChange={(v) => updateLightingGroup(group.id, { dailyUsageHours: v })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {lightingGroups.length === 0 && (
              <div className="text-center py-12 bg-surface-subtle border border-surface-border border-dashed rounded-xl">
                <p className="text-text-muted mb-4">Niste dodali nijednu sobu. Kliknite na dugme iznad.</p>
                <Button variant="primary" onClick={handleAddRoom}>Dodaj sobu</Button>
              </div>
            )}
          </div>

          <Button 
            variant="primary" 
            size="xl" 
            className="w-full mt-4" 
            onClick={handleCalculate}
            disabled={lightingGroups.length === 0}
            isLoading={calculateMutation.isPending}
          >
            Izračunaj uštedu
          </Button>

        </div>

        {/* RIGHT PANEL - RESULTS */}
        <div className="relative">
          <div className="sticky top-24">
            {!ledResult && !calculateMutation.isPending ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-subtle border border-surface-border rounded-2xl h-[600px]">
                <div className="w-24 h-24 bg-surface-card rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <LineChart className="w-10 h-10 text-text-muted" />
                </div>
                <h3 className="text-xl font-display font-semibold text-text-primary mb-2">Unesite parametre kalkulatora</h3>
                <p className="text-text-muted">Dodajte sobe levo i kliknite izračunaj kako biste dobili detaljnu analizu povrata investicije i preporuke.</p>
              </div>
            ) : calculateMutation.isPending ? (
              <div className="animate-pulse flex flex-col gap-4 h-[600px] border border-surface-border bg-surface-subtle rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-surface-border rounded-xl"></div>
                  <div className="h-24 bg-surface-border rounded-xl"></div>
                  <div className="h-24 bg-surface-border rounded-xl"></div>
                  <div className="h-24 bg-surface-border rounded-xl"></div>
                </div>
                <div className="flex-1 bg-surface-border rounded-xl mt-4"></div>
              </div>
            ) : ledResult ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6"
              >
                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card variant="stat">
                    <CardContent className="p-5">
                      <div className="text-sm font-semibold text-text-muted mb-1 flex items-center gap-2"><Zap className="w-4 h-4"/> Ušteda putanja</div>
                      <div className="text-2xl lg:text-3xl font-display font-bold text-primary">
                        <CountUpNumber value={ledResult.totalAnnualSavingsRsd} format="rsd" />
                      </div>
                      <div className="text-xs text-text-secondary mt-1">Godišnje</div>
                    </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-accent">
                    <CardContent className="p-5">
                      <div className="text-sm font-semibold text-text-muted mb-1 flex items-center gap-2"><Zap className="w-4 h-4"/> Smanjenje potrošnje</div>
                      <div className="text-2xl lg:text-3xl font-display font-bold text-accent">
                        <CountUpNumber value={ledResult.totalAnnualSavingsKwh} format="kwh" />
                      </div>
                      <div className="text-xs text-text-secondary mt-1">Godišnje</div>
                    </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-amber-500">
                    <CardContent className="p-5">
                      <div className="text-sm font-semibold text-text-muted mb-1 flex items-center gap-2"><Clock className="w-4 h-4"/> Povrat uloženog</div>
                      <div className="text-2xl lg:text-3xl font-display font-bold text-amber-500">
                        <CountUpNumber value={ledResult.paybackMonths} decimals={1} /> mes
                      </div>
                      <div className="text-xs text-text-secondary mt-1">Break-even tačka</div>
                    </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-emerald-500">
                    <CardContent className="p-5">
                      <div className="text-sm font-semibold text-text-muted mb-1 flex items-center gap-2"><Leaf className="w-4 h-4"/> Eko otisak</div>
                      <div className="text-2xl lg:text-3xl font-display font-bold text-emerald-500">
                        <CountUpNumber value={ledResult.co2ReductionKg} /> kg
                      </div>
                      <div className="text-xs text-text-secondary mt-1">CO₂ manje godišnje</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Consumption Chart */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-lg mb-6">Poređenje potrošnje (10 godina)</h3>
                    <div className="h-64 w-full text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <RCLineChart data={ledResult.projections}>
                          <XAxis dataKey="year" stroke="#9AC4AD" tick={{fill: '#9AC4AD'}} />
                          <YAxis stroke="#9AC4AD" tick={{fill: '#9AC4AD'}} />
                          <RechartsTooltip formatter={(value) => [`${value} RSD`, '']} />
                          <Legend />
                          <Line type="monotone" dataKey="costWithoutLed" name="Bez LED rasvete" stroke="#EF4444" strokeWidth={3} dot={false} />
                          <Line type="monotone" dataKey="costWithLed" name="Sa LED (Uključeno ulaganje)" stroke="#22C55E" strokeWidth={3} dot={false} />
                        </RCLineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Recommendations */}
                <div className="mt-2">
                  <h3 className="font-display font-semibold mb-4 text-text-primary">Naše preporuke za vas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {ledResult.recommendedProducts.map((prod: any) => (
                      <div key={prod.id} className="bg-surface-card border border-surface-border rounded-xl p-4 flex flex-col hover:shadow-md transition-shadow">
                        <div className="w-full h-24 mb-3 rounded-lg flex items-center justify-center bg-surface-subtle">
                          <Lightbulb className="w-10 h-10 text-primary opacity-50" />
                        </div>
                        <span className="font-medium text-sm text-text-primary line-clamp-2 leading-tight">{prod.name}</span>
                        <div className="mt-auto pt-3 flex justify-between items-center bg-white">
                          <span className="font-bold text-primary">{prod.price} RSD</span>
                          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg"><ShoppingCart className="w-4 h-4"/></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
};

// Fallback icon for card if lucide import issue
const Lightbulb = ({className}: {className: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
