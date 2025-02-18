'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api/client';
import type { App } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchApps = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getApps();
      if (response.data) {
        setApps(response.data);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch apps',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Apps</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create App
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Bundle ID</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : apps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No apps found. Create your first app to get started.
                </TableCell>
              </TableRow>
            ) : (
              apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>{app.bundleId}</TableCell>
                  <TableCell className="capitalize">{app.platform}</TableCell>
                  <TableCell>
                    <Badge variant={app.status === 'active' ? 'success' : 'warning'}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
