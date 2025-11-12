'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, DollarSign, ShoppingCart, BarChart3, PieChartIcon, Package, ListTodo } from 'lucide-react';
import { collection, query } from 'firebase/firestore';
import type { StationeryOrder, StationeryItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { useMemo } from 'react';
import { format, parseISO, startOfDay } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {data.name}
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[0].name === 'value' ? `$${data.value.toFixed(2)}` : data.value}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const DailyPerformanceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <p className="font-bold mb-1">{label}</p>
                {payload.map((pld: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.fill }}></div>
                        <span className="capitalize text-muted-foreground">{pld.name}:</span>
                        <span className="font-medium">{pld.name === 'Revenue' ? `$${pld.value.toFixed(2)}` : pld.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function StationeryAnalyticsPage() {
  const db = useFirestore();
  
  const ordersQuery = useMemoFirebase(() => db ? query(collection(db, 'allStationeryOrders')) : null, [db]);
  const { data: orders, isLoading: ordersLoading } = useCollection<StationeryOrder>(ordersQuery);
  
  const itemsQuery = useMemoFirebase(() => db ? query(collection(db, 'stationeryItems')) : null, [db]);
  const { data: items, isLoading: itemsLoading } = useCollection<StationeryItem>(itemsQuery);

  const isLoading = ordersLoading || itemsLoading;

  const {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    avgItemsPerOrder,
    dailyData,
    popularItems,
    revenueByCategory,
    orderStatusDistribution
  } = useMemo(() => {
    if (!orders || !items) return {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      avgItemsPerOrder: 0,
      dailyData: [],
      popularItems: [],
      revenueByCategory: [],
      orderStatusDistribution: [],
    };

    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    const itemMap = new Map<string, { name: string; quantity: number }>();
    const statusMap = new Map<string, number>();

    let totalRevenue = 0;
    let totalItemsSold = 0;

    orders.forEach(order => {
      totalRevenue += order.totalAmount;

      const day = format(startOfDay(parseISO(order.orderDate)), 'yyyy-MM-dd');
      const dayData = dailyMap.get(day) || { revenue: 0, orders: 0 };
      dayData.revenue += order.totalAmount;
      dayData.orders += 1;
      dailyMap.set(day, dayData);

      order.items.forEach(item => {
        totalItemsSold += item.quantity;
        const itemData = itemMap.get(item.itemId) || { name: item.name, quantity: 0 };
        itemData.quantity += item.quantity;
        itemMap.set(item.itemId, itemData);
      });
      
      statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);
    });
    
    const categoryMap = new Map<string, number>();
    items.forEach(item => {
        const itemSales = itemMap.get(item.id);
        if(itemSales) {
            const categoryRevenue = categoryMap.get(item.category) || 0;
            categoryMap.set(item.category, categoryRevenue + (item.price * itemSales.quantity));
        }
    });


    const dailyData = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date: format(parseISO(date), 'MMM d'), ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const popularItems = Array.from(itemMap.entries())
      .map(([id, data]) => ({ id, name: data.name, value: data.quantity }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const revenueByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
    const orderStatusDistribution = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));

    const totalOrdersCount = orders.length;
    return {
      totalRevenue,
      totalOrders: totalOrdersCount,
      avgOrderValue: totalRevenue / (totalOrdersCount || 1),
      avgItemsPerOrder: totalItemsSold / (totalOrdersCount || 1),
      dailyData,
      popularItems,
      revenueByCategory,
      orderStatusDistribution
    };
  }, [orders, items]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <AreaChart />
          <span>Stationery Analytics</span>
        </CardTitle>
        <CardDescription>
          Insights into stationery sales and order trends.
        </CardDescription>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalOrders}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Items/Order</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{avgItemsPerOrder.toFixed(1)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3/> Daily Performance</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dailyData}>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
              <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`}/>
              <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
              <Tooltip content={<DailyPerformanceTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="orders" name="Orders" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><PieChartIcon /> Popular Items (by quantity)</CardTitle></CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                          <Pie data={popularItems} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label={false}>
                              {popularItems.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} formatter={(value: number) => `${value} units`}/>
                          <Legend />
                      </PieChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>
           <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><PieChartIcon /> Revenue by Category</CardTitle></CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                          <Pie data={revenueByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label={false}>
                              {revenueByCategory.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} formatter={(value: number) => `$${value.toFixed(2)}`} />
                          <Legend />
                      </PieChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>
           <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ListTodo /> Order Status</CardTitle></CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                          <Pie data={orderStatusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label={false}>
                              {orderStatusDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                      </PieChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
