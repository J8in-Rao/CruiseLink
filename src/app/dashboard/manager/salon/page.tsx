'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, query, orderBy, doc, writeBatch } from "firebase/firestore";
import { BeautySalonBooking } from "@/types";
import { format, parseISO } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Scissors, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ManagerSalonBookingsPage() {
    const db = useFirestore();
    const { toast } = useToast();

    const bookingsQuery = useMemoFirebase(
        () => db ? query(collection(db, 'allBeautySalonBookings'), orderBy('appointmentTime', 'desc')) : null,
        [db]
    );

    const { data: bookings, isLoading } = useCollection<BeautySalonBooking>(bookingsQuery);

    const handleCancelBooking = (booking: BeautySalonBooking) => {
        if (!db || !booking.originalBookingId) {
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Original booking ID is missing.' });
            return;
        };
        const managerBookingRef = doc(db, 'allBeautySalonBookings', booking.id);
        const userBookingRef = doc(db, 'voyagers', booking.voyagerId, 'beautySalonBookings', booking.originalBookingId);

        const batch = writeBatch(db);
        batch.update(managerBookingRef, { status: 'Cancelled' });
        batch.update(userBookingRef, { status: 'Cancelled' });

        batch.commit().then(() => {
            toast({ title: 'Booking Cancelled', description: 'The salon appointment has been cancelled.' });
        }).catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: `allBeautySalonBookings/${booking.id} or user booking`,
                operation: 'update',
                requestResourceData: { status: 'Cancelled' },
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ 
                variant: 'destructive', 
                title: 'Update Failed', 
                description: 'Could not cancel the booking. You may not have the required permissions.' 
            });
        });
    };

    const getStatusVariant = (status: BeautySalonBooking['status']) => {
        return status === 'Cancelled' ? 'destructive' : 'secondary';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Scissors /><span>All Salon Bookings</span></CardTitle>
                <CardDescription>An overview of all beauty salon appointments.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Voyager</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Appointment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Voyager</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Appointment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings && bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.voyagerName}</TableCell>
                                        <TableCell>{booking.serviceType}</TableCell>
                                        <TableCell>{format(parseISO(booking.appointmentTime), 'MMM d, yyyy, h:mm a')}</TableCell>
                                        <TableCell><Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleCancelBooking(booking)} disabled={booking.status === 'Cancelled'}>
                                                        Cancel Booking
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="text-center">No salon bookings found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
