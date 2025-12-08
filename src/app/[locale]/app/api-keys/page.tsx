"use client";

import { useState } from 'react';
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

// Mock Data
const initialKeys = [
  { id: '1', name: 'Production', key: 'sk_live_...2384', created: '2023-10-15', lastUsed: '2 mins ago', status: 'active' },
  { id: '2', name: 'Development', key: 'sk_test_...9921', created: '2023-11-01', lastUsed: '1 day ago', status: 'active' },
  { id: '3', name: 'Staging', key: 'sk_test_...8842', created: '2023-09-20', lastUsed: '3 months ago', status: 'revoked' },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(initialKeys);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleGenerateKey = () => {
    if (!newKeyName) return;
    setIsGenerating(true);
    
    // Simulate generation
    setTimeout(() => {
      const newKey = `sk_live_${Math.random().toString(36).substring(7)}${Math.random().toString(36).substring(7)}`;
      setGeneratedKey(newKey);
      setKeys([
        { 
          id: Math.random().toString(), 
          name: newKeyName, 
          key: `sk_live_...${newKey.slice(-4)}`, 
          created: new Date().toISOString().split('T')[0], 
          lastUsed: 'Never', 
          status: 'active' 
        },
        ...keys
      ]);
      setNewKeyName('');
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground mt-2">
          Manage your API keys for accessing the Civify API programmatically.
        </p>
      </div>

      {/* Generate Key Section */}
      <Dialog>
        <DialogTrigger asChild>
          <Card className="border-dashed border-2 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer w-full max-w-sm">
             <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                   <h3 className="font-semibold text-lg">Generate New API Key</h3>
                   <p className="text-sm text-muted-foreground">Create a new key for your application</p>
                </div>
             </CardContent>
          </Card>
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
                <DialogDescription className="text-red-500 font-medium bg-red-50 p-2 rounded-md mt-2 flex items-center gap-2">
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
                <Button onClick={() => setGeneratedKey(null)}>Done</Button>
              </DialogFooter>
            </>
           )}
        </DialogContent>
      </Dialog>

      {/* Existing Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Keys</CardTitle>
          <CardDescription>
            A list of all API keys associated with your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Name</TableHead>
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
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell className="font-mono text-xs">{key.key}</TableCell>
                  <TableCell>{key.created}</TableCell>
                  <TableCell>{key.lastUsed}</TableCell>
                  <TableCell>
                    <Badge variant={key.status === 'active' ? 'default' : 'destructive'} className={key.status === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}>
                      {key.status === 'active' ? 'Active' : 'Revoked'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {key.status === 'active' && (
                      <Button variant="ghost" size="sm" onClick={() => handleRevoke(key.id)} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                         Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
