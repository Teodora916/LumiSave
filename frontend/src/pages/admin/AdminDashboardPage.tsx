import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountUpNumber } from '@/components/ui/CountUpNumber';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, ShoppingBag, CreditCard, RefreshCw, Zap } from 'lucide-react';
import { adminApi } from '@/api/admin';
import type { TransactionStatsDto, SalesDataPointDto } from '@/api/admin';
import { useNavigate } from 'react-router-dom';

function getDateRange(daysBack: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - daysBack);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<TransactionStatsDto | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPointDto[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<{ id: string; totalAmount: number; status: string; createdAt: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { from, to } = getDateRange(180); // Last 6 months

      const [statsResult, salesResult, ordersResult] = await Promise.allSettled([
        adminApi.getTransactionStats(),
        adminApi.getSalesReport(from, to, 'month'),
        // Use orders endpoint for recent orders — reuse the ordersApi if needed,
        // but admin orders list is under /api/orders/admin/all
        fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/orders/admin/all?page=1&pageSize=5`, {
          headers: {
            Authorization: `Bearer ${(() => {
              try { return JSON.parse(localStorage.getItem('lumisave-auth') ?? '{}')?.state?.token ?? ''; } catch { return ''; }
            })()}`,
          },
        }).then((r) => r.json()),
      ]);

      if (statsResult.status === 'fulfilled') setStats(statsResult.value);
      if (salesResult.status === 'fulfilled') {
        setSalesData(salesResult.value.dataPoints ?? []);
        setTopProducts(salesResult.value.topProducts ?? []);
      }
      if (ordersResult.status === 'fulfilled') {
        setRecentOrders((ordersResult.value?.items ?? []).slice(0, 5));
      }
    } catch {
      // Individual errors are shown via the api/client.ts toast interceptor
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const chartData = salesData.map((d) => ({
    name: new Date(d.period).toLocaleDateString('sr-RS', { month: 'short', year: '2-digit' }),
    total: Math.round(d.totalRevenue),
  }));

  const formatStatus = (s: string) => {
    const map: Record<string, string> = {
      Pending: 'Na čekanju',
      Paid: 'Plaćeno',
      Processing: 'U obradi',
      Shipped: 'Poslato',
      Delivered: 'Dostavljeno',
      Cancelled: 'Otkazano',
    };
    return map[s] ?? s;
  };

  const statusColor = (s: string) => {
    if (s === 'Paid' || s === 'Delivered') return 'text-accent';
    if (s === 'Cancelled') return 'text-red-500';
    return 'text-amber-500';
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Pregled Dashboarda</h1>
          <p className="text-text-muted">Izveštaji i statistika za tekući period.</p>
        </div>
        <button
          onClick={() => { fetchData(); setLastRefresh(new Date()); }}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Ažuriraj</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="stat">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Ukupan Prihod</CardTitle>
            <CreditCard className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 bg-surface-subtle rounded animate-pulse w-2/3" />
            ) : (
              <div className="text-2xl font-bold text-primary">
                <CountUpNumber value={stats?.totalRevenue ?? 0} format="rsd" />
              </div>
            )}
            <p className="text-xs text-accent flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> Ukupno naplaćeno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Narudžbine</CardTitle>
            <ShoppingBag className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 bg-surface-subtle rounded animate-pulse w-1/2" />
            ) : (
              <div className="text-2xl font-bold text-text-primary">
                <CountUpNumber value={stats?.totalTransactions ?? 0} />
              </div>
            )}
            <p className="text-xs text-accent flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> Uspešne: {stats?.successfulTransactions ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Prosečna narudžbina</CardTitle>
            <Users className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 bg-surface-subtle rounded animate-pulse w-1/2" />
            ) : (
              <div className="text-2xl font-bold text-text-primary">
                <CountUpNumber value={stats?.averageOrderValue ?? 0} format="rsd" />
              </div>
            )}
            <p className="text-xs text-text-muted mt-1">Prosečna vrednost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Refundirano</CardTitle>
            <TrendingUp className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 bg-surface-subtle rounded animate-pulse w-1/2" />
            ) : (
              <div className="text-2xl font-bold text-red-500">
                <CountUpNumber value={stats?.refundedAmount ?? 0} format="rsd" />
              </div>
            )}
            <p className="text-xs text-text-muted mt-1">Ukupno refundirano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Ušteđena Energija</CardTitle>
            <Zap className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 bg-surface-subtle rounded animate-pulse w-1/2" />
            ) : (
              <div className="text-2xl font-bold text-accent">
                <CountUpNumber value={stats?.totalEnergySavedKwh ?? 0} />
              </div>
            )}
            <p className="text-xs text-text-muted mt-1">Ukupno kWh</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Prihod u poslednjih 6 meseci</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] bg-surface-subtle rounded-xl animate-pulse" />
            ) : chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-text-muted text-sm">
                Nema podataka za izabrani period.
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#9AC4AD" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9AC4AD" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString('sr-RS')} RSD`, 'Prihod']} />
                    <Area type="monotone" dataKey="total" stroke="#22C55E" fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Nedavne Narudžbine</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-10 bg-surface-subtle rounded animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">Nema narudžbina.</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between border-b border-surface-border last:border-0 pb-4 last:pb-0 cursor-pointer hover:bg-surface-subtle/50 -mx-2 px-2 rounded-lg transition-colors group"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString('sr-RS')}</span>
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="text-sm font-bold text-primary">{Number(order.totalAmount).toLocaleString('sr-RS')} RSD</span>
                      <span className={`text-xs ${statusColor(order.status)}`}>{formatStatus(order.status)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Najprodavaniji Proizvodi</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-10 bg-surface-subtle rounded animate-pulse" />
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">Nema podataka.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-muted uppercase bg-surface-subtle">
                    <tr>
                      <th className="px-4 py-2">Proizvod</th>
                      <th className="px-4 py-2 text-right">Prodato Kom.</th>
                      <th className="px-4 py-2 text-right">Prihod (RSD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p) => (
                      <tr key={p.productId} className="border-b border-surface-border">
                        <td className="px-4 py-3 font-medium text-text-primary">{p.productName}</td>
                        <td className="px-4 py-3 text-right">{p.unitsSold}</td>
                        <td className="px-4 py-3 text-right font-bold text-primary">{Number(p.revenue).toLocaleString('sr-RS')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-text-muted text-right">
        Poslednje ažurirano: {lastRefresh.toLocaleTimeString('sr-RS')}
      </p>
    </div>
  );
};
