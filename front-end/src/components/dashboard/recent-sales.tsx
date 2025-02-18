'use client';

import { useEffect, useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';

interface Sale {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  product: {
    name: string;
    price: number;
    currency: string;
  };
  purchasedAt: string;
}

export function RecentSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecentSales = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getRecentSales();
      if (response.data) {
        setSales(response.data);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch recent sales',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentSales();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {sales.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No recent sales to display
            </div>
          ) : (
            sales.map((sale) => (
              <div key={sale.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={sale.user.avatar} alt={sale.user.name} />
                  <AvatarFallback>
                    {sale.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{sale.user.name}</p>
                  <p className="text-sm text-muted-foreground">{sale.user.email}</p>
                </div>
                <div className="ml-auto font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: sale.product.currency,
                  }).format(sale.product.price)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
