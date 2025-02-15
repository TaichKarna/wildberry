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
import type { Offering } from '@/lib/api/types';

export default function OfferingsPage() {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchOfferings = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getOfferings();
      if (response.data) {
        setOfferings(response.data);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch offerings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferings();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Offerings</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Offering
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Entitlements</TableHead>
              <TableHead>App</TableHead>
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
            ) : offerings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No offerings found. Create your first offering to get started.
                </TableCell>
              </TableRow>
            ) : (
              offerings.map((offering) => (
                <TableRow key={offering.id}>
                  <TableCell className="font-medium">{offering.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {offering.products.map((productId, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10"
                        >
                          {productId}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {offering.entitlements.map((entitlementId, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10"
                        >
                          {entitlementId}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{offering.appId}</TableCell>
                  <TableCell>
                    {new Date(offering.createdAt).toLocaleDateString()}
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
