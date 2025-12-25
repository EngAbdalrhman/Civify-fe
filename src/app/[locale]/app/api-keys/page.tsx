"use client";

import { useState, useEffect } from 'react';
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

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch API keys on mount
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
      toast.error('Failed to load API keys');
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
      toast.success('API key generated successfully');
      // Refresh the list
      await fetchApiKeys();
      setNewKeyName('');
    } catch (error) {
      console.error('Failed to generate API key:', error);
      toast.error('Failed to generate API key');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiKeyService.revokeApiKey(id);
      toast.success('API key revoked successfully');
      await fetchApiKeys();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      toast.error('Failed to revoke API key');  
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setGeneratedKey(null);
    setNewKeyName('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground mt-2">
          Manage your API keys for accessing the Civify API programmatically.
        </p>
      </div>

      {/* Generate Key Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Your API Keys</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage API keys to access the Civify API programmatically
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/app/api-documentation">
              <Book className="h-4 w-4 mr-2" />
              View Documentation
            </Link>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Generate New Key
              </Button>
            </DialogTrigger>
          
            <DialogContent className="sm:max-w-md">
               {!generatedKey ? (
                <>
                  <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                    <DialogDescription>
                      Enter a name for your new API key to help you identify it later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Input 
                        id="name" 
                        placeholder="e.g. Website Checkout" 
                        className="col-span-4" 
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleGenerateKey} disabled={isGenerating || !newKeyName}>
                      {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Generate Key
                    </Button>
                  </DialogFooter>
                </>
               ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>API Key Generated</DialogTitle>
                    <DialogDescription className="text-red-500 font-medium bg-red-50 dark:bg-red-950/20 p-2 rounded-md mt-2 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      Please copy this key now. You won't be able to see it again!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2 my-4">
                    <Input value={generatedKey} readOnly className="font-mono bg-muted" />
                    <Button size="icon" variant="outline" onClick={() => handleCopy(generatedKey)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleDialogClose}>Done</Button>
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
          <CardTitle>Existing Keys</CardTitle>
          <CardDescription>
            A list of all API keys associated with your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No API keys found. Generate your first key to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key ID</TableHead>
                  <TableHead>Masked Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={!key.revoked ? 'default' : 'destructive'} className={!key.revoked ? 'bg-green-600 hover:bg-green-700' : ''}>
                        {!key.revoked ? 'Active' : 'Revoked'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!key.revoked && (
                        <Button variant="ghost" size="sm" onClick={() => handleRevoke(key.id)} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                           Revoke
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
  );
}
