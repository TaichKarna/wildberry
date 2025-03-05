'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api/client';
import type { Entitlement, App } from '@/lib/api/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EntitlementsPage() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEntitlement, setNewEntitlement] = useState({ name: '', appId: '', description: '', features: '' });
  const { toast } = useToast();

  const fetchEntitlements = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getEntitlements();
      if (response.data) {
        setEntitlements(response.data.entitlements || response.data);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch entitlements' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApps = async () => {
    try {
      const response = await apiClient.getApps();
      if (response.data) {
        setApps(response.data.apps || response.data);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch apps',
      });
    }
  };

  const handleCreateEntitlement = async () => {
    try {
      const features = newEntitlement.features.split(',').map((f) => f.trim());
      const response = await apiClient.createEntitlement({ 
        name: newEntitlement.name, 
        appId: newEntitlement.appId, 
        description: newEntitlement.description || undefined, 
        features 
      });
      
      if (response.data) {
        setEntitlements([...entitlements, response.data]);
        setIsDialogOpen(false);
        setNewEntitlement({ name: '', appId: '', description: '', features: '' });
        toast({ title: 'Success', description: 'Entitlement created successfully' });
        
        // Refresh entitlements list
        fetchEntitlements();
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create entitlement' });
    }
  };

  useEffect(() => {
    fetchEntitlements();
    fetchApps();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Entitlements</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Entitlement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Entitlement</DialogTitle>
              <DialogDescription>Add a new entitlement to your catalog.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input 
                  id="name" 
                  value={newEntitlement.name} 
                  onChange={(e) => setNewEntitlement({ ...newEntitlement, name: e.target.value })} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="appId" className="text-right">App</Label>
                <select
                  id="appId"
                  value={newEntitlement.appId}
                  onChange={(e) => setNewEntitlement({ ...newEntitlement, appId: e.target.value })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select an app</option>
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="features" className="text-right">Features</Label>
                <Input 
                  id="features" 
                  value={newEntitlement.features} 
                  onChange={(e) => setNewEntitlement({ ...newEntitlement, features: e.target.value })} 
                  className="col-span-3" 
                  placeholder="Comma-separated list" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input 
                  id="description" 
                  value={newEntitlement.description} 
                  onChange={(e) => setNewEntitlement({ ...newEntitlement, description: e.target.value })} 
                  className="col-span-3" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateEntitlement}>Create Entitlement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>App</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : entitlements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No entitlements found. Create your first entitlement to get started.</TableCell>
              </TableRow>
            ) : (
              entitlements.map((entitlement) => (
                <TableRow key={entitlement.id}>
                  <TableCell className="font-medium">{entitlement.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {entitlement.features.map((feature, index) => (
                        <span key={index} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{feature}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{entitlement.appId}</TableCell>
                  <TableCell>{new Date(entitlement.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
