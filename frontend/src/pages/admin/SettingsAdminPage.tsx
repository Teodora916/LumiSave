import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminApi, type SystemSettingDto } from '@/api/admin';
import { toast } from 'sonner';

export const SettingsAdminPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getSettings();
      setSettings(response);
      const initialEdits: Record<string, string> = {};
      response.forEach((s) => {
        initialEdits[s.id] = s.value;
      });
      setEditValues(initialEdits);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (id: string) => {
    setSavingId(id);
    try {
      const value = editValues[id];
      await adminApi.updateSetting(id, value);
      toast.success('Podešavanja su sačuvana');
      // Update local state to reflect saved value
      setSettings((prev) => prev.map(s => s.id === id ? { ...s, value } : s));
    } catch (error) {
      toast.error('Greška pri čuvanju');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Sistemska Podešavanja</h1>
        <p className="text-text-muted">Upravljanje parametrima kalkulatora energetske efikasnosti.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parametri Energetske Uštede</CardTitle>
          <CardDescription>
            Ove vrednosti se koriste u proračunima unutar LED i Smart Home kalkulatora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-surface-subtle animate-pulse rounded" />
              ))}
            </div>
          ) : settings.length === 0 ? (
            <p className="text-text-muted">Nema definisanih podešavanja. Pokrenite seed.</p>
          ) : (
            <div className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-surface-border rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-text-primary">{setting.key}</h3>
                    {setting.description && (
                      <p className="text-xs text-text-muted mt-1">{setting.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type={setting.type === 'decimal' || setting.type === 'int' ? 'number' : 'text'}
                      value={editValues[setting.id] || ''}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, [setting.id]: e.target.value }))}
                      className="w-32"
                    />
                    <Button
                      onClick={() => handleSave(setting.id)}
                      disabled={savingId === setting.id || editValues[setting.id] === setting.value}
                      variant={editValues[setting.id] !== setting.value ? 'primary' : 'outline'}
                    >
                      {savingId === setting.id ? 'Čuvanje...' : 'Sačuvaj'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
