import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ordersApi, type OrderSummaryDto } from '@/api/orders';
import { formatRSD } from '@/lib/utils';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusMap: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
  Pending: { label: 'Na čekanju', color: 'text-amber-500 bg-amber-50 border-amber-200', icon: <Clock className="w-4 h-4" /> },
  Processing: { label: 'U obradi', color: 'text-blue-500 bg-blue-50 border-blue-200', icon: <Clock className="w-4 h-4" /> },
  Shipped: { label: 'Poslato', color: 'text-indigo-500 bg-indigo-50 border-indigo-200', icon: <Package className="w-4 h-4" /> },
  Delivered: { label: 'Isporučeno', color: 'text-emerald-500 bg-emerald-50 border-emerald-200', icon: <CheckCircle className="w-4 h-4" /> },
  Cancelled: { label: 'Otkazano', color: 'text-red-500 bg-red-50 border-red-200', icon: <XCircle className="w-4 h-4" /> },
};

export const OrdersHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    ordersApi.getMyOrders(1, 50)
      .then(res => setOrders(res.items))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
        <Package className="w-8 h-8 text-primary" /> Moje Narudžbine
      </h1>

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Nemate narudžbina</h2>
            <p className="text-text-muted mb-6">Još uvek niste napravili nijednu narudžbinu na našem sajtu.</p>
            <Button variant="primary" onClick={() => navigate('/shop')}>Započnite kupovinu</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => {
            const statusInfo = statusMap[order.status] || { label: order.status, color: 'text-gray-500 bg-gray-50 border-gray-200', icon: <Package className="w-4 h-4" /> };
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-text-muted">#{order.id.slice(0,8).toUpperCase()}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-sm text-text-muted">
                        {new Date(order.createdAt).toLocaleDateString('sr-RS', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end md:gap-8 w-full md:w-auto">
                      <div className="text-left md:text-right">
                        <div className="text-sm text-text-muted mb-1">{order.itemCount} {order.itemCount === 1 ? 'artikal' : 'artikala'}</div>
                        <div className="font-bold text-lg text-primary">{formatRSD(order.totalAmount)}</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="group-hover:bg-primary group-hover:text-white transition-colors"
                      >
                        Detalji
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
