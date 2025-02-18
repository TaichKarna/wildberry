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
import type { Entitlement } from '@/lib/api/types';

export default function EntitlementsPage() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEntitlements = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getEntitlements();
      if (response.data) {
        setEntitlements(response.data);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch entitlements',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntitlements();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Entitlements</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Entitlement
        </Button>
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
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : entitlements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No entitlements found. Create your first entitlement to get started.
                </TableCell>
              </TableRow>
            ) : (
              entitlements.map((entitlement) => (
                <TableRow key={entitlement.id}>
                  <TableCell className="font-medium">{entitlement.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {entitlement.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{entitlement.appId}</TableCell>
                  <TableCell>
                    {new Date(entitlement.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
