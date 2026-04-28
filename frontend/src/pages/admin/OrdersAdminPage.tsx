import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminApi, type OrderSummaryDto } from '@/api/admin';
import { toast } from 'sonner';

export const OrdersAdminPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getOrders(1, 50);
      setOrders(response.items);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const updated = await adminApi.updateOrderStatus(id, newStatus);
      setOrders((prev) => prev.map(o => o.id === id ? { ...o, status: updated.status } : o));
      toast.success('Status narudžbine ažuriran');
    } catch (error) {
      toast.error('Greška pri ažuriranju statusa');
    }
  };

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
    if (s === 'Paid' || s === 'Delivered' || s === 'Shipped' || s === 'Processing') return 'text-accent bg-accent/10';
    if (s === 'Cancelled') return 'text-red-500 bg-red-500/10';
    return 'text-amber-500 bg-amber-500/10';
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Narudžbine</h1>
        <p className="text-text-muted">Pregled i upravljanje narudžbinama.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sve Narudžbine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-muted uppercase bg-surface-subtle">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Datum</th>
                  <th className="px-6 py-3">Iznos (RSD)</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Promena Statusa</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">Učitavanje...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">Nema narudžbina</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-surface-border">
                      <td className="px-6 py-4 font-medium text-text-primary">
                        {order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted">
                        {new Date(order.createdAt).toLocaleDateString('sr-RS')}
                      </td>
                      <td className="px-6 py-4 font-bold">{Number(order.totalAmount).toLocaleString('sr-RS')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2 flex">
                        <select
                          className="bg-surface-subtle border border-surface-border rounded px-2 py-1 text-xs"
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        >
                          <option value="Pending">Na čekanju</option>
                          <option value="Paid">Plaćeno</option>
                          <option value="Processing">U obradi</option>
                          <option value="Shipped">Poslato</option>
                          <option value="Delivered">Dostavljeno</option>
                          <option value="Cancelled">Otkazano</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
