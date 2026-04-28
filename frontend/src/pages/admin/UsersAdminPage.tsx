import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi, type UserDto } from '@/api/admin';
import { toast } from 'sonner';

export const UsersAdminPage: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getUsers(1, 50, search);
      setUsers(response.items);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]); // Search debounce could be added here

  const handleToggleActive = async (id: string) => {
    try {
      const updated = await adminApi.toggleUserActive(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success('Status korisnika ažuriran');
    } catch (error) {
      toast.error('Greška pri ažuriranju statusa');
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const updated = await adminApi.updateUserRole(id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success('Uloga korisnika ažurirana');
    } catch (error) {
      toast.error('Greška pri ažuriranju uloge');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Korisnici</h1>
        <p className="text-text-muted">Upravljanje korisničkim nalozima.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Spisak Korisnika</CardTitle>
          <Input
            placeholder="Pretraga po emailu..."
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
                  <th className="px-6 py-3">Korisnik</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Uloga</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Potrošnja (RSD)</th>
                  <th className="px-6 py-3 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">Učitavanje...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">Nema korisnika</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-surface-border">
                      <td className="px-6 py-4 font-medium text-text-primary">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          className="bg-transparent border border-surface-border rounded px-2 py-1"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          <option value="CUSTOMER">Kupac</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-500'}`}>
                          {user.isActive ? 'Aktivan' : 'Suspendovan'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{Number(user.totalSpentRsd).toLocaleString('sr-RS')}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleActive(user.id)}
                        >
                          {user.isActive ? 'Suspenduj' : 'Aktiviraj'}
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
