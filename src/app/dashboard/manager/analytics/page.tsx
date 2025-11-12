'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Film, Scissors, Dumbbell, PartyPopper } from 'lucide-react';
import { collection, query } from 'firebase/firestore';
import type { ResortMovieTicket, BeautySalonBooking, FitnessCenterBooking, PartyHallBooking } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { useMemo } from 'react';
import { format, parseISO, startOfDay } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function BookingAnalyticsPage() {
    const db = useFirestore();

    const movieQuery = useMemoFirebase(() => db ? query(collection(db, 'allResortMovieTickets')) : null, [db]);
    const salonQuery = useMemoFirebase(() => db ? query(collection(db, 'allBeautySalonBookings')) : null, [db]);
    const fitnessQuery = useMemoFirebase(() => db ? query(collection(db, 'allFitnessCenterBookings')) : null, [db]);
    const partyQuery = useMemoFirebase(() => db ? query(collection(db, 'allPartyHallBookings')) : null, [db]);

    const { data: movieBookings, isLoading: movieLoading } = useCollection<ResortMovieTicket>(movieQuery);
    const { data: salonBookings, isLoading: salonLoading } = useCollection<BeautySalonBooking>(salonQuery);
    const { data: fitnessBookings, isLoading: fitnessLoading } = useCollection<FitnessCenterBooking>(fitnessQuery);
    const { data: partyBookings, isLoading: partyLoading } = useCollection<PartyHallBooking>(partyQuery);

    const isLoading = movieLoading || salonLoading || fitnessLoading || partyLoading;

    const { totalBookings, dailyData, typeDistribution } = useMemo(() => {
        const allBookings = [
            ...(movieBookings || []).map(b => ({ type: 'Movies', date: b.showtime })),
            ...(salonBookings || []).map(b => ({ type: 'Salon', date: b.appointmentTime })),
            ...(fitnessBookings || []).map(b => ({ type: 'Fitness', date: b.startTime })),
            ...(partyBookings || []).map(b => ({ type: 'Party Hall', date: b.startTime })),
        ];

        const dailyMap = new Map<string, number>();
        const typeMap = new Map<string, number>();

        allBookings.forEach(booking => {
            const day = format(startOfDay(parseISO(booking.date)), 'yyyy-MM-dd');
            dailyMap.set(day, (dailyMap.get(day) || 0) + 1);

            typeMap.set(booking.type, (typeMap.get(booking.type) || 0) + 1);
        });

        const dailyData = Array.from(dailyMap.entries())
            .map(([date, count]) => ({ date: format(parseISO(date), 'MMM d'), bookings: count }))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const typeDistribution = Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));

        return { totalBookings: allBookings.length, dailyData, typeDistribution };

    }, [movieBookings, salonBookings, fitnessBookings, partyBookings]);


     if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28" />
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
                <span>Booking Analytics</span>
            </CardTitle>
            <CardDescription>
            Insights into booking trends across all services.
            </CardDescription>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalBookings}</div>
                </CardContent>
            </Card>
             {typeDistribution.map(item => (
                <Card key={item.name}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{item.name} Bookings</CardTitle>
                        {item.name === 'Movies' && <Film className="h-4 w-4 text-muted-foreground" />}
                        {item.name === 'Salon' && <Scissors className="h-4 w-4 text-muted-foreground" />}
                        {item.name === 'Fitness' && <Dumbbell className="h-4 w-4 text-muted-foreground" />}
                        {item.name === 'Party Hall' && <PartyPopper className="h-4 w-4 text-muted-foreground" />}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>

         <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Daily Booking Volume</CardTitle>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyData}>
                            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
                            <Tooltip wrapperClassName="rounded-md border bg-background p-2 shadow-sm" />
                            <Bar dataKey="bookings" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Booking Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                          <Pie 
                            data={typeDistribution} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5}
                            label={false}
                           >
                              {typeDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip wrapperClassName="rounded-md border bg-background p-2 shadow-sm" />
                          <Legend />
                      </PieChart>
                  </ResponsiveContainer>
                </CardContent>
            </Card>
         </div>
    </div>
  );
}
