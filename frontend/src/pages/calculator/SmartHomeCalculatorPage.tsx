import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Zap, Plug, Thermometer, Lightbulb, Sun, LineChart, ShoppingCart } from 'lucide-react';
import { CountUpNumber } from '@/components/ui/CountUpNumber';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { useMutation } from '@tanstack/react-query';
import { calculatorApi } from '@/api/calculator';
import type { SmartHomeCalculatorResultDto } from '@/api/calculator';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

import { useCalculatorStore } from '@/stores/calculatorStore';

const VAMPIRE_DEVICES: { type: string; label: string; standbyW: number }[] = [
  { type: 'Television',          label: 'TV',            standbyW: 1.5  },
  { type: 'DesktopComputer',     label: 'PC / Laptop',   standbyW: 10 },
  { type: 'Microwave',           label: 'Mikrotalasna',  standbyW: 3.5  },
  { type: 'WifiRouter',          label: 'Ruter',         standbyW: 7.5  },
  { type: 'WashingMachine',      label: 'Veš mašina',    standbyW: 2.0  },
  { type: 'Dishwasher',          label: 'Mašina za sudove', standbyW: 2.5 },
];

export const SmartHomeCalculatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('vampire');
  const [result, setResult] = useState<SmartHomeCalculatorResultDto | null>(null);
  const [electricityPrice] = useState(12.5);

  // Vampire Power state
  const [selectedDevices, setSelectedDevices] = useState<Record<string, number>>({});

  // Smart Plug state
  const [smartPlugCount, setSmartPlugCount] = useState(0);

  // Thermostat state
  const [monthlyHeatingCost, setMonthlyHeatingCost] = useState(0);
  const [heatingType, setHeatingType] = useState('electric');

  const { addItem } = useCartStore();
  const { ledResult } = useCalculatorStore();
  
  const allFieldsFilled = Object.keys(selectedDevices).length > 0 && smartPlugCount > 0 && monthlyHeatingCost > 0;

  const calculateMutation = useMutation({
    mutationFn: () =>
      calculatorApi.calculateSmartHome({
        electricityPriceRsd: electricityPrice,
        vampirePower:
          Object.keys(selectedDevices).length > 0
            ? {
                devices: Object.entries(selectedDevices).map(([type, qty]) => ({
                  deviceType: type,
                  quantity: qty,
                  customStandbyWatts: VAMPIRE_DEVICES.find(d => d.type === type)?.standbyW,
                })),
              }
            : undefined,
        smartPlug:
          smartPlugCount > 0
            ? {
                deviceTypes: Object.keys(selectedDevices),
                smartPlugPriceRsd: 1800,
                smartPlugCount,
              }
            : undefined,
        thermostat:
          monthlyHeatingCost > 0
            ? {
                heatingType,
                monthlyHeatingCostRsd: monthlyHeatingCost,
                currentThermostatType: 'manual',
                zoneCount: 1,
                smartThermostatPriceRsd: 15000,
              }
            : undefined,
        lightingAutomation: ledResult ? {
            annualLightingCostRsd: Number(ledResult.totalLedAnnualKwh) * electricityPrice,
            automationTypes: ["MotionSensor"],
            equipmentCostRsd: 5000,
        } : undefined,
      }),
    onSuccess: (data) => {
      setResult(data);
      setActiveTab('results');
      toast.success('Analiza završena! Pogledajte rezultate.');
    },
  });

  const handleQuantityChange = (type: string, delta: number) => {
    setSelectedDevices((prev) => {
      const next = { ...prev };
      const current = next[type] || 0;
      const updated = current + delta;
      if (updated > 0) {
        next[type] = updated;
      } else {
        delete next[type];
      }
      return next;
    });
  };

  const handleAddProductToCart = (prod: { id: string; name: string; price: number; imageUrl?: string }, quantity: number = 1) => {
    addItem({ productId: prod.id, name: prod.name, price: prod.price, quantity: quantity, imageUrl: prod.imageUrl });
    toast.success(`Dodato u korpu: ${prod.name}`);
  };

  const score = result?.smartHomeScore ?? 0;
  const displayScore = result ? score : 65; // Show placeholder 65 before first calc

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* HERO — Score */}
      <section className="bg-surface-card rounded-2xl p-6 md:p-10 mb-8 border border-surface-border shadow-sm flex flex-col md:flex-row items-center gap-8 md:gap-12 sticky top-24 z-10">
        <ScoreRing score={displayScore} size={140} animated={true} />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Vaš Smart Home Score</h1>
          {result ? (
            <>
              <p className="text-text-muted mb-4 max-w-lg">
                {result.scoreGrade} — {result.scoreInsights?.[0] ?? 'Konfiguriš vaš dom energetski.'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-surface-subtle rounded-lg p-3 border border-surface-border">
                  <div className="text-text-muted text-xs mb-1">Godišnja ušteda</div>
                  <div className="font-bold text-accent">
                    <CountUpNumber value={Number(result.totalAnnualSavingsRsd)} format="rsd" />
                  </div>
                </div>
                <div className="bg-surface-subtle rounded-lg p-3 border border-surface-border">
                  <div className="text-text-muted text-xs mb-1">Investicija</div>
                  <div className="font-bold text-text-primary">
                    <CountUpNumber value={Number(result.totalInvestmentRsd)} format="rsd" />
                  </div>
                </div>
                <div className="bg-surface-subtle rounded-lg p-3 border border-surface-border">
                  <div className="text-text-muted text-xs mb-1">CO₂ ušteda</div>
                  <div className="font-bold text-emerald-500">
                    <CountUpNumber value={Number(result.co2ReductionKgPerYear)} /> kg/god
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-text-muted mb-4 max-w-lg">
              Konfigurišite sekcije ispod i kliknite <strong>Analiziraj dom</strong> kako biste dobili personalizovane preporuke i uštede.
            </p>
          )}
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => calculateMutation.mutate()}
          isLoading={calculateMutation.isPending}
          disabled={!allFieldsFilled}
          className="shrink-0"
        >
          Analiziraj dom
        </Button>
      </section>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row gap-8">

        <TabsList className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 w-full md:w-64 shrink-0">
          {[
            { id: 'vampire',   label: 'Vampire Power',       icon: <Zap className="w-5 h-5"/> },
            { id: 'smartplugs',label: 'Smart Plugs',         icon: <Plug className="w-5 h-5"/> },
            { id: 'thermostat',label: 'Grejanje (Termostat)',icon: <Thermometer className="w-5 h-5"/> },
            { id: 'lighting',  label: 'Automatska Rasveta',  icon: <Lightbulb className="w-5 h-5"/> },
            { id: 'results',   label: 'Zbirni Rezultati',    icon: <LineChart className="w-5 h-5"/> },
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

          {/* VAMPIRE POWER TAB */}
          <TabsContent value="vampire" className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2"><Zap className="text-accent" /> Vampire Power (Standby)</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-text-muted mb-6">Mnogi uređaji troše struju čak i kada su isključeni, ali su uključeni u utičnicu. Izaberite uređaje koje imate u kući.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {VAMPIRE_DEVICES.map((device) => (
                    <div
                      key={device.type}
                      className={`border rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                        selectedDevices[device.type] > 0
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-surface-border bg-surface-subtle'
                      }`}
                    >
                      <div className="w-12 h-12 bg-surface-card rounded-full flex items-center justify-center mb-2 shadow-sm font-bold text-lg">
                        {device.label[0]}
                      </div>
                      <span className="font-medium text-sm mb-1">{device.label}</span>
                      <span className="text-xs text-red-400 mb-3">~{device.standbyW}W standby</span>
                      <div className="flex items-center gap-2 mt-auto">
                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(device.type, -1)} disabled={!selectedDevices[device.type]}>-</Button>
                        <span className="w-4 text-sm font-bold">{selectedDevices[device.type] || 0}</span>
                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(device.type, 1)}>+</Button>
                      </div>
                    </div>
                  ))}
                </div>
                {Object.keys(selectedDevices).length > 0 && (
                  <div className="mt-4 p-3 bg-surface-subtle border border-surface-border rounded-lg text-sm text-text-muted">
                    ✅ Izabrano {Object.keys(selectedDevices).length} tipova uređaja — kliknite <strong>Analiziraj dom</strong> gore za rezultate.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMART PLUGS TAB */}
          <TabsContent value="smartplugs" className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-display font-semibold mb-6">Smart Plugs Ušteda</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-text-muted mb-4">Ugasite 'vampire' uređaje potpuno noću koristeći pametne utičnice.</p>
                <div className="mb-6">
                  <label className="block mb-2 font-medium">Broj Smart Utičnica: {smartPlugCount}</label>
                  <RangeSlider min={0} max={20} value={smartPlugCount} onChange={setSmartPlugCount} />
                </div>
                {smartPlugCount > 0 && (
                  <div className="bg-surface-subtle border border-surface-border p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-sm text-text-muted">Procenjena mesečna ušteda</div>
                      <div className="text-2xl font-bold text-accent">
                        <CountUpNumber value={smartPlugCount * 120} /> RSD
                      </div>
                      <div className="text-xs text-text-muted mt-1">Investicija: {(smartPlugCount * 1800).toLocaleString('sr-RS')} RSD</div>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => handleAddProductToCart({ id: 'plug-01', name: 'Smart Plug', price: 1800, slug: 'smart-plug' }, smartPlugCount)}>Dodaj u korpu {smartPlugCount} kom.</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* THERMOSTAT TAB */}
          <TabsContent value="thermostat" className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2"><Thermometer className="text-amber-500" /> Grejanje &amp; Termostat</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-text-muted mb-6">Smart termostat može smanjiti troškove grejanja za 15–30% automatskim podešavanjem temperature.</p>
                <div className="mb-6">
                  <label className="block mb-2 font-medium">Mesečni troškovi grejanja: {monthlyHeatingCost.toLocaleString('sr-RS')} RSD</label>
                  <RangeSlider min={0} max={30000} step={500} value={monthlyHeatingCost} onChange={setMonthlyHeatingCost} />
                </div>
                {monthlyHeatingCost > 0 && (
                  <div className="bg-surface-subtle border border-surface-border p-4 rounded-xl">
                    <div className="text-sm text-text-muted mb-1">Procenjena godišnja ušteda (25%)</div>
                    <div className="text-2xl font-bold text-accent">
                      <CountUpNumber value={Math.round(monthlyHeatingCost * 12 * 0.25)} /> RSD
                    </div>
                    <div className="text-xs text-text-muted mt-1">Investicija u smart termostat: ~15.000 RSD</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LIGHTING AUTOMATION TAB */}
          <TabsContent value="lighting" className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2"><Lightbulb className="text-yellow-500" /> Automatska Rasveta</h2>
            <Card>
              <CardContent className="p-6 text-center py-12">
                <Lightbulb className="w-16 h-16 text-yellow-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Senzori pokreta i dimeri</h3>
                <p className="text-text-muted mb-6">Automatska rasveta sa senzorima pokreta može smanjiti potrošnju za 30–50%. Koristite LED Kalkulator za detaljnu analizu rasvete.</p>
                <Button variant="secondary" onClick={() => window.location.href = '/calculator/led'}>Otvori LED Kalkulator</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SOLAR TAB REMOVED */}

          {/* RESULTS TAB */}
          <TabsContent value="results" className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2"><LineChart className="text-primary" /> Zbirni Rezultati</h2>
            {!result ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-text-muted mb-4">Popunite sekcije i kliknite <strong>Analiziraj dom</strong> da vidite rezultate.</p>
                  <Button variant="primary" onClick={() => calculateMutation.mutate()} isLoading={calculateMutation.isPending} disabled={!allFieldsFilled}>
                    Analiziraj dom
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Summary KPIs */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-5">
                      <div className="text-xs text-text-muted mb-1">Ukupna godišnja ušteda</div>
                      <div className="text-2xl font-bold text-primary"><CountUpNumber value={Number(result.totalAnnualSavingsRsd)} format="rsd" /></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <div className="text-xs text-text-muted mb-1">Ukupna investicija</div>
                      <div className="text-2xl font-bold text-text-primary"><CountUpNumber value={Number(result.totalInvestmentRsd)} format="rsd" /></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <div className="text-xs text-text-muted mb-1">Povrat investicije</div>
                      <div className="text-2xl font-bold text-amber-500"><CountUpNumber value={result.averagePaybackMonths} /> mes</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <div className="text-xs text-text-muted mb-1">CO₂ ušteda</div>
                      <div className="text-2xl font-bold text-emerald-500"><CountUpNumber value={Number(result.co2ReductionKgPerYear)} /> kg/god</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Insights */}
                {result.scoreInsights && result.scoreInsights.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3">Preporuke za optimizaciju</h3>
                      <ul className="flex flex-col gap-2">
                        {result.scoreInsights.map((insight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                            <span className="text-primary mt-0.5">→</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommended Products */}
                {result.recommendedProducts && result.recommendedProducts.length > 0 && (
                  <div>
                    <h3 className="font-display font-semibold mb-4">Preporučeni proizvodi</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {result.recommendedProducts.map((prod) => (
                        <div key={prod.id} className="bg-surface-card border border-surface-border rounded-xl p-4 flex flex-col hover:shadow-md transition-shadow">
                          <div className="w-full h-20 mb-3 rounded-lg flex items-center justify-center bg-surface-subtle overflow-hidden">
                            {prod.imageUrl
                              ? <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-contain p-2" />
                              : <Zap className="w-8 h-8 text-primary opacity-40" />
                            }
                          </div>
                          <span className="font-medium text-sm text-text-primary line-clamp-2 leading-tight">{prod.name}</span>
                          <div className="mt-auto pt-3 flex justify-between items-center">
                            <span className="font-bold text-primary text-sm">{Number(prod.price).toLocaleString('sr-RS')} RSD</span>
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg" onClick={() => handleAddProductToCart(prod)}>
                              <ShoppingCart className="w-4 h-4"/>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
};
