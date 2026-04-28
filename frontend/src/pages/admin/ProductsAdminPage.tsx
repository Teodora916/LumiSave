import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi, type ProductDto } from '@/api/admin';
import { toast } from 'sonner';

export const ProductsAdminPage: React.FC = () => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getProducts(1, 50, search);
      setProducts(response.items);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]); // Search debounce could be added here

  const handleDelete = async (id: string) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter(p => p.id !== id));
      toast.success('Proizvod uspešno obrisan');
    } catch (error) {
      toast.error('Greška pri brisanju proizvoda');
    }
  };

  const handleStockUpdate = async (id: string, currentStock: number) => {
    const amountStr = window.prompt('Unesite promenu stanja (npr. 5 za dodavanje, -3 za skidanje):');
    if (!amountStr) return;
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount)) {
      toast.error('Nevalidan unos');
      return;
    }
    try {
      await adminApi.updateStock(id, amount);
      setProducts((prev) => prev.map(p => p.id === id ? { ...p, stockQuantity: Math.max(0, p.stockQuantity + amount) } : p));
      toast.success('Stanje uspešno ažurirano');
    } catch (error) {
      toast.error('Greška pri ažuriranju stanja');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Proizvodi</h1>
          <p className="text-text-muted">Upravljanje asortimanom i stanjem na lageru.</p>
        </div>
        <Button onClick={() => toast.info('Dodavanje proizvoda će biti implementirano uskoro')}>
          Dodaj Proizvod
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Svi Proizvodi</CardTitle>
          <Input
            placeholder="Pretraga..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-muted uppercase bg-surface-subtle">
                <tr>
                  <th className="px-6 py-3">Naziv</th>
                  <th className="px-6 py-3">SKU / Slug</th>
                  <th className="px-6 py-3">Cena (RSD)</th>
                  <th className="px-6 py-3">Na Stanju</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">Učitavanje...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">Nema proizvoda</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b border-surface-border">
                      <td className="px-6 py-4 font-medium text-text-primary">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted">{product.slug}</td>
                      <td className="px-6 py-4 font-bold">{Number(product.price).toLocaleString('sr-RS')}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${product.stockQuantity > 5 ? 'text-accent' : 'text-amber-500'}`}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${product.isActive ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-500'}`}>
                          {product.isActive ? 'Aktivan' : 'Neaktivan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStockUpdate(product.id, product.stockQuantity)}
                        >
                          Zalihe
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          Obriši
                        </Button>
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
