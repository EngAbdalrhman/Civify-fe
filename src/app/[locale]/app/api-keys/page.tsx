"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Plus, 
  Copy, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Link } from '@/i18n/routing';
import { Book } from 'lucide-react';
import { apiKeyService, type ApiKey } from '@/services/api-key.service';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function ApiKeysPage() {
  const t = useTranslations('apiKeys');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const data = await apiKeyService.getUserApiKeys();
      setKeys(data);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      toast.error(t('loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!newKeyName) return;
    setIsGenerating(true);
    
    try {
      const rawKey = await apiKeyService.createApiKey();
      setGeneratedKey(rawKey);
      toast.success(t('generateSuccess'));
      await fetchApiKeys();
      setNewKeyName('');
    } catch (error) {
      console.error('Failed to generate API key:', error);
      toast.error(t('generateError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('copied'));
  };

  const handleRevoke = async (id: number) => {
    if (!confirm(t('revokeConfirm'))) {
      return;
    }

    try {
      await apiKeyService.revokeApiKey(id);
      toast.success(t('revokeSuccess'));
      await fetchApiKeys();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      toast.error(t('revokeError'));  
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setGeneratedKey(null);
    setNewKeyName('');
  };

  return (
    <PermissionGuard permissions={['API.ACCESS', 'API.KEY.CREATE']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>

        {/* Generate Key Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">{t('yourKeys')}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('manageKeys')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/app/api-documentation">
                <Book className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {t('viewDocs')}
              </Link>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {t('generateNew')}
                </Button>
              </DialogTrigger>
            
              <DialogContent className="sm:max-w-md">
                 {!generatedKey ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>{t('createTitle')}</DialogTitle>
                      <DialogDescription>
                        {t('createDesc')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Input 
                          id="name" 
                          placeholder={t('namePlaceholder')} 
                          className="col-span-4" 
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleGenerateKey} disabled={isGenerating || !newKeyName}>
                        {isGenerating ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> : null}
                        {t('generateKey')}
                      </Button>
                    </DialogFooter>
                  </>
                 ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle>{t('keyGenerated')}</DialogTitle>
                      <DialogDescription className="text-red-500 font-medium bg-red-50 dark:bg-red-950/20 p-2 rounded-md mt-2 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        {t('copyWarning')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 my-4">
                      <Input value={generatedKey} readOnly className="font-mono bg-muted" />
                      <Button size="icon" variant="outline" onClick={() => handleCopy(generatedKey)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleDialogClose}>{t('done')}</Button>
                    </DialogFooter>
                  </>
                 )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Existing Keys Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('existingKeys')}</CardTitle>
            <CardDescription>
              {t('existingKeysDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : keys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('noKeys')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('keyId')}</TableHead>
                    <TableHead>{t('maskedKey')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <TableHead>{t('lastUsed')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">#{key.id}</TableCell>
                      <TableCell className="font-mono text-xs">{key.keyPreview}</TableCell>
                      <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {key.lastUsedAt 
                          ? new Date(key.lastUsedAt).toLocaleDateString()
                          : t('never')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={!key.revoked ? 'default' : 'destructive'} className={!key.revoked ? 'bg-green-600 hover:bg-green-700' : ''}>
                          {!key.revoked ? t('active') : t('revoked')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!key.revoked && (
                          <Button variant="ghost" size="sm" onClick={() => handleRevoke(key.id)} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                             {t('revoke')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
