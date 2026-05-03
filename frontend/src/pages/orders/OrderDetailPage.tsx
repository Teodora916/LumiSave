import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ordersApi, type OrderDetailDto } from '@/api/orders';
import { adminApi } from '@/api/admin';
import { useAuthStore } from '@/stores/authStore';
import { formatRSD } from '@/lib/utils';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  User, 
  Truck, 
  CreditCard, 
  Calendar,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const statusMap: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
  Pending: { label: 'Na čekanju', color: 'text-amber-500 bg-amber-50 border-amber-200', icon: <Clock className="w-4 h-4" /> },
  Processing: { label: 'U obradi', color: 'text-blue-500 bg-blue-50 border-blue-200', icon: <Clock className="w-4 h-4" /> },
  Shipped: { label: 'Poslato', color: 'text-indigo-500 bg-indigo-50 border-indigo-200', icon: <Truck className="w-4 h-4" /> },
  Delivered: { label: 'Isporučeno', color: 'text-emerald-500 bg-emerald-50 border-emerald-200', icon: <CheckCircle className="w-4 h-4" /> },
  Cancelled: { label: 'Otkazano', color: 'text-red-500 bg-red-50 border-red-200', icon: <XCircle className="w-4 h-4" /> },
  Paid: { label: 'Plaćeno', color: 'text-accent bg-accent/10 border-accent/20', icon: <CreditCard className="w-4 h-4" /> },
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    ordersApi.getOrderById(id)
      .then(res => setOrder(res))
      .catch(() => toast.error('Greška pri učitavanju narudžbine'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id || !isAdmin) return;
    
    setIsUpdating(true);
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success('Status narudžbine ažuriran');
    } catch (error) {
      toast.error('Greška pri ažuriranju statusa');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Narudžbina nije pronađena</h2>
        <Button onClick={() => navigate(isAdmin ? '/admin/orders' : '/orders')}>Povratak na listu</Button>
      </div>
    );
  }

  const statusInfo = statusMap[order.status] || { label: order.status, color: 'text-gray-500 bg-gray-50 border-gray-200', icon: <Package className="w-4 h-4" /> };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-slide-up">
      {/* Breadcrumbs / Back button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-6 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Nazad na listu
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold">Narudžbina #{order.id.slice(0, 8).toUpperCase()}</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-4 text-text-muted text-sm">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(order.createdAt).toLocaleDateString('sr-RS', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3 bg-surface-card p-3 rounded-xl border border-surface-border shadow-sm">
            <span className="text-sm font-medium text-text-muted whitespace-nowrap">Promeni status:</span>
            <select
              className="bg-surface-subtle border border-surface-border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
              value={order.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={isUpdating}
            >
              <option value="Pending">Na čekanju</option>
              <option value="Paid">Plaćeno</option>
              <option value="Processing">U obradi</option>
              <option value="Shipped">Poslato</option>
              <option value="Delivered">Dostavljeno</option>
              <option value="Cancelled">Otkazano</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Items */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="border-b border-surface-border">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Stavke Narudžbine
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-subtle text-text-muted uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="px-6 py-4 text-left">Proizvod</th>
                      <th className="px-6 py-4 text-center">Količina</th>
                      <th className="px-6 py-4 text-right">Cena</th>
                      <th className="px-6 py-4 text-right">Ukupno</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {item.productImageUrl && (
                              <img src={item.productImageUrl} alt={item.productNameSnapshot} className="w-12 h-12 object-cover rounded-lg border border-surface-border" />
                            )}
                            <div>
                              <div className="font-bold text-text-primary">{item.productNameSnapshot}</div>
                              <div className="text-xs text-text-muted font-mono">{item.productSkuSnapshot}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                        <td className="px-6 py-4 text-right">{formatRSD(item.unitPrice)}</td>
                        <td className="px-6 py-4 text-right font-bold text-primary">{formatRSD(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Plaćanje i Transakcija
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.stripeTransaction ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <div className="text-text-muted">ID Transakcije:</div>
                    <div className="font-mono text-xs bg-surface-subtle p-2 rounded border border-surface-border">
                      {order.stripeTransaction.paymentIntentId}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-text-muted">Status plaćanja:</div>
                    <div className={`font-bold ${order.stripeTransaction.status === 'succeeded' ? 'text-accent' : 'text-amber-500'}`}>
                      {order.stripeTransaction.status === 'succeeded' ? 'Uspešno naplaćeno' : order.stripeTransaction.status}
                      {order.stripeTransaction.isRefunded && <span className="ml-2 text-red-500">(Refundirano)</span>}
                    </div>
                  </div>
                  {order.stripeTransaction.receiptUrl && (
                    <div className="md:col-span-2">
                      <a 
                        href={order.stripeTransaction.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                      >
                        Pogledaj račun na Stripe-u <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-text-muted text-sm italic">Nema informacija o transakciji.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Customer & Summary */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4 text-primary" /> Kupac
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-text-muted mb-1">Ime i Prezime</div>
                <div className="font-bold">{order.shippingFirstName} {order.shippingLastName}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">Telefon</div>
                <div className="font-medium">{order.shippingPhone}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="w-4 h-4 text-primary" /> Dostava
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-text-muted mb-1">Adresa</div>
                <div className="font-medium">{order.shippingAddress}</div>
                <div className="font-medium">{order.shippingPostalCode} {order.shippingCity}</div>
                <div className="font-medium">{order.shippingCountry}</div>
              </div>
              {order.notes && (
                <div>
                  <div className="text-xs text-text-muted mb-1">Napomena</div>
                  <div className="text-sm bg-surface-subtle p-3 rounded-lg border border-surface-border">
                    {order.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary text-text-inverse border-0 shadow-glow">
            <CardHeader>
              <CardTitle className="text-text-inverse flex items-center gap-2 text-base">
                Rekapitulacija
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm opacity-90">
                <span>Iznos artikala</span>
                <span>{formatRSD(order.subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm opacity-90">
                <span>Dostava</span>
                <span>{order.shippingCost === 0 ? 'Besplatna' : formatRSD(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm opacity-90">
                <span>Porez (uključen)</span>
                <span>{formatRSD(order.taxAmount)}</span>
              </div>
              <div className="pt-3 border-t border-text-inverse/20 flex justify-between items-baseline">
                <span className="font-bold uppercase tracking-wider text-xs">Ukupno</span>
                <span className="text-2xl font-black">{formatRSD(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
