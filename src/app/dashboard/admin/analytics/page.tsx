'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Users, ShoppingCart, DollarSign, BarChart3, PieChartIcon } from 'lucide-react';
import { collection, query } from 'firebase/firestore';
import type { CateringOrder, StationeryOrder, UserProfile } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { useMemo } from 'react';
import { format, parseISO, startOfDay } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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


export default function AdminAnalyticsPage() {
    const db = useFirestore();

    const cateringQuery = useMemoFirebase(() => db ? query(collection(db, 'allCateringOrders')) : null, [db]);
    const stationeryQuery = useMemoFirebase(() => db ? query(collection(db, 'allStationeryOrders')) : null, [db]);
    const voyagersQuery = useMemoFirebase(() => db ? query(collection(db, 'voyagers')) : null, [db]);

    const { data: cateringOrders, isLoading: cateringLoading } = useCollection<CateringOrder>(cateringQuery);
    const { data: stationeryOrders, isLoading: stationeryLoading } = useCollection<StationeryOrder>(stationeryQuery);
    const { data: voyagers, isLoading: voyagersLoading } = useCollection<UserProfile>(voyagersQuery);

    const isLoading = cateringLoading || stationeryLoading || voyagersLoading;

    const { 
        totalRevenue, 
        totalOrders, 
        totalVoyagers, 
        dailyData,
        categoryRevenue
    } = useMemo(() => {
        const allOrders = [
            ...(cateringOrders || []).map(o => ({ ...o, type: 'Catering' })),
            ...(stationeryOrders || []).map(o => ({ ...o, type: 'Stationery' })),
        ];

        const dailyMap = new Map<string, { revenue: number; orders: number }>();
        const categoryMap = new Map<string, number>();
        let totalRevenue = 0;

        allOrders.forEach(order => {
            totalRevenue += order.totalAmount;

            const day = format(startOfDay(parseISO(order.orderDate)), 'yyyy-MM-dd');
            const dayData = dailyMap.get(day) || { revenue: 0, orders: 0 };
            dayData.revenue += order.totalAmount;
            dayData.orders += 1;
            dailyMap.set(day, dayData);

            categoryMap.set(order.type, (categoryMap.get(order.type) || 0) + order.totalAmount);
        });

        const dailyData = Array.from(dailyMap.entries())
            .map(([date, data]) => ({ date: format(parseISO(date), 'MMM d'), ...data }))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
        const categoryRevenue = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

        return { 
            totalRevenue, 
            totalOrders: allOrders.length, 
            totalVoyagers: voyagers?.length || 0,
            dailyData,
            categoryRevenue
        };

    }, [cateringOrders, stationeryOrders, voyagers]);


     if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
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
                <span>Overall Analytics</span>
            </CardTitle>
            <CardDescription>
                A high-level overview of your cruise operations.
            </CardDescription>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-3">
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
                    <CardTitle className="text-sm font-medium">Total Voyagers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{totalVoyagers}</div></CardContent>
            </Card>
        </div>

         <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3/> Daily Performance</CardTitle>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyData}>
                            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`}/>
                            <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <Tooltip content={<DailyPerformanceTooltip />}/>
                            <Legend />
                            <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="orders" name="Orders" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PieChartIcon /> Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                          <Pie 
                            data={categoryRevenue} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5}
                            label={false}
                          >
                              {categoryRevenue.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} wrapperClassName="rounded-md border bg-background p-2 shadow-sm" />
                          <Legend />
                      </PieChart>
                  </ResponsiveContainer>
                </CardContent>
            </Card>
         </div>
    </div>
  );
}
