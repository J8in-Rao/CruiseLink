'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import Link from 'next/link';
import {
  ResortMovieTicket,
  BeautySalonBooking,
  FitnessCenterBooking,
  PartyHallBooking,
} from '@/types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { CalendarCheck, Film, Scissors, Dumbbell, PartyPopper, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type MyBookingsProps = {
  userId: string;
  isPreview?: boolean;
};

const getStatusVariant = (status: 'Confirmed' | 'Cancelled' | undefined) => {
  if (!status) return 'default';
  return status === 'Cancelled' ? 'destructive' : 'secondary';
};


const MovieBookingsTab = ({ userId, isPreview }: { userId: string, isPreview?: boolean }) => {
    const db = useFirestore();
    const queryRef = useMemoFirebase(() => {
        if (!db || !userId) return null;
        const q = query(collection(db, 'voyagers', userId, 'resortMovieTickets'), orderBy('showtime', 'desc'));
        return isPreview ? query(q, limit(3)) : q;
    }, [db, userId, isPreview]);
    const { data: bookings, isLoading } = useCollection<ResortMovieTicket>(queryRef);

    if (isLoading) return <Skeleton className="h-48 w-full" />;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Movie</TableHead>
                    <TableHead>Showtime</TableHead>
                    <TableHead>Seat</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings && bookings.length > 0 ? bookings.map(b => (
                    <TableRow key={b.id}>
                        <TableCell>{b.movieName}</TableCell>
                        <TableCell>{format(parseISO(b.showtime), 'MMM d, h:mm a')}</TableCell>
                        <TableCell>{b.seatNumber}</TableCell>
                        <TableCell><Badge variant={getStatusVariant(b.status)}>{b.status}</Badge></TableCell>
                    </TableRow>
                )) : <TableRow><TableCell colSpan={4} className="text-center">No movie bookings found.</TableCell></TableRow>}
            </TableBody>
        </Table>
    );
};

const SalonBookingsTab = ({ userId, isPreview }: { userId: string, isPreview?: boolean }) => {
    const db = useFirestore();
    const queryRef = useMemoFirebase(() => {
        if (!db || !userId) return null;
        const q = query(collection(db, 'voyagers', userId, 'beautySalonBookings'), orderBy('appointmentTime', 'desc'));
        return isPreview ? query(q, limit(3)) : q;
    }, [db, userId, isPreview]);
    const { data: bookings, isLoading } = useCollection<BeautySalonBooking>(queryRef);
    
    if (isLoading) return <Skeleton className="h-48 w-full" />;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Appointment</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings && bookings.length > 0 ? bookings.map(b => (
                    <TableRow key={b.id}>
                        <TableCell>{b.serviceType}</TableCell>
                        <TableCell>{format(parseISO(b.appointmentTime), 'MMM d, h:mm a')}</TableCell>
                        <TableCell><Badge variant={getStatusVariant(b.status)}>{b.status}</Badge></TableCell>
                    </TableRow>
                )) : <TableRow><TableCell colSpan={3} className="text-center">No salon bookings found.</TableCell></TableRow>}
            </TableBody>
        </Table>
    );
};

const FitnessBookingsTab = ({ userId, isPreview }: { userId: string, isPreview?: boolean }) => {
    const db = useFirestore();
    const queryRef = useMemoFirebase(() => {
        if (!db || !userId) return null;
        const q = query(collection(db, 'voyagers', userId, 'fitnessCenterBookings'), orderBy('startTime', 'desc'));
        return isPreview ? query(q, limit(3)) : q;
    }, [db, userId, isPreview]);
    const { data: bookings, isLoading } = useCollection<FitnessCenterBooking>(queryRef);
    
    if (isLoading) return <Skeleton className="h-48 w-full" />;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings && bookings.length > 0 ? bookings.map(b => (
                    <TableRow key={b.id}>
                        <TableCell>{b.trainingEquipment}</TableCell>
                        <TableCell>{format(parseISO(b.startTime), 'MMM d, h:mm a')} - {format(parseISO(b.endTime), 'h:mm a')}</TableCell>
                        <TableCell><Badge variant={getStatusVariant(b.status)}>{b.status}</Badge></TableCell>
                    </TableRow>
                )) : <TableRow><TableCell colSpan={3} className="text-center">No fitness bookings found.</TableCell></TableRow>}
            </TableBody>
        </Table>
    );
};

const PartyHallBookingsTab = ({ userId, isPreview }: { userId: string, isPreview?: boolean }) => {
    const db = useFirestore();
    const queryRef = useMemoFirebase(() => {
        if (!db || !userId) return null;
        const q = query(collection(db, 'voyagers', userId, 'partyHallBookings'), orderBy('startTime', 'desc'));
        return isPreview ? query(q, limit(3)) : q;
    }, [db, userId, isPreview]);
    const { data: bookings, isLoading } = useCollection<PartyHallBooking>(queryRef);
    
    if (isLoading) return <Skeleton className="h-48 w-full" />;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings && bookings.length > 0 ? bookings.map(b => (
                    <TableRow key={b.id}>
                        <TableCell>{b.hallType}</TableCell>
                        <TableCell>{format(parseISO(b.startTime), 'MMM d, h:mm a')} - {format(parseISO(b.endTime), 'h:mm a')}</TableCell>
                        <TableCell><Badge variant={getStatusVariant(b.status)}>{b.status}</Badge></TableCell>
                    </TableRow>
                )) : <TableRow><TableCell colSpan={3} className="text-center">No party hall bookings found.</TableCell></TableRow>}
            </TableBody>
        </Table>
    );
};

export function MyBookings({ userId, isPreview = false }: MyBookingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            <span>My Bookings</span>
        </CardTitle>
        <CardDescription>An overview of all your upcoming reservations.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="movies">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="movies"><Film className="h-4 w-4 mr-2"/>Movies</TabsTrigger>
            <TabsTrigger value="salon"><Scissors className="h-4 w-4 mr-2"/>Salon</TabsTrigger>
            <TabsTrigger value="fitness"><Dumbbell className="h-4 w-4 mr-2"/>Fitness</TabsTrigger>
            <TabsTrigger value="party"><PartyPopper className="h-4 w-4 mr-2"/>Party Hall</TabsTrigger>
          </TabsList>
          <TabsContent value="movies" className="mt-4"><MovieBookingsTab userId={userId} isPreview={isPreview} /></TabsContent>
          <TabsContent value="salon" className="mt-4"><SalonBookingsTab userId={userId} isPreview={isPreview} /></TabsContent>
          <TabsContent value="fitness" className="mt-4"><FitnessBookingsTab userId={userId} isPreview={isPreview} /></TabsContent>
          <TabsContent value="party" className="mt-4"><PartyHallBookingsTab userId={userId} isPreview={isPreview} /></TabsContent>
        </Tabs>
      </CardContent>
       {isPreview && (
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/my-bookings">
              View All Bookings <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
