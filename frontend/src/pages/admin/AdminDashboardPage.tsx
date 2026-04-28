import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountUpNumber } from '@/components/ui/CountUpNumber';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, ShoppingBag, CreditCard } from 'lucide-react';

const mockData = [
  { name: 'Jan', total: 120000 },
  { name: 'Feb', total: 150000 },
  { name: 'Mar', total: 180000 },
  { name: 'Apr', total: 220000 },
  { name: 'May', total: 250000 },
  { name: 'Jun', total: 310000 },
];

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Pregled Dashboarda</h1>
        <p className="text-text-muted">Izveštaji i statistika za tekući period.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="stat">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Ukupan Prihod</CardTitle>
            <CreditCard className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
               <CountUpNumber value={1234500} format="rsd" />
            </div>
            <p className="text-xs text-accent flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> +12.5% od prošlog meseca
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Narudžbine</CardTitle>
            <ShoppingBag className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
               <CountUpNumber value={342} />
            </div>
            <p className="text-xs text-accent flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> +5.2% od prošlog meseca
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Novi Korisnici</CardTitle>
            <Users className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
               <CountUpNumber value={85} />
            </div>
            <p className="text-xs text-accent flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> +18.1% od prošlog meseca
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Konverzija</CardTitle>
            <TrendingUp className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
               <CountUpNumber value={4.3} decimals={1} format="percent" />
            </div>
            <p className="text-xs text-red-500 flex items-center mt-1">
               -0.3% od prošlog meseca
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Prihod u poslednjih 6 meseci</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#9AC4AD" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9AC4AD" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip formatter={(value) => [`${value} RSD`, 'Prihod']} />
                  <Area type="monotone" dataKey="total" stroke="#22C55E" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nedavne Narudžbine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-surface-border last:border-0 pb-4 last:pb-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-primary">ORD-{8000+i}</span>
                    <span className="text-xs text-text-muted">Korisnik {i}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-sm font-bold text-primary">{2500 * i} RSD</span>
                    <span className="text-xs text-accent">Plaćeno</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
