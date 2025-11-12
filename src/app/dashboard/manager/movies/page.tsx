'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, query, orderBy, doc, writeBatch } from "firebase/firestore";
import { ResortMovieTicket } from "@/types";
import { format, parseISO } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Film, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ManagerMovieBookingsPage() {
    const db = useFirestore();
    const { toast } = useToast();

    const bookingsQuery = useMemoFirebase(
        () => db ? query(collection(db, 'allResortMovieTickets'), orderBy('showtime', 'desc')) : null,
        [db]
    );

    const { data: bookings, isLoading } = useCollection<ResortMovieTicket>(bookingsQuery);
    
    const handleCancelBooking = async (booking: ResortMovieTicket) => {
        if (!db) return;
        const managerBookingRef = doc(db, 'allResortMovieTickets', booking.id);
        const userBookingRef = doc(db, 'voyagers', booking.voyagerId, 'resortMovieTickets', booking.originalTicketId!);
        
        const batch = writeBatch(db);
        batch.update(managerBookingRef, { status: 'Cancelled' });
        batch.update(userBookingRef, { status: 'Cancelled' });
        
        batch.commit().then(() => {
             toast({
                title: 'Booking Cancelled',
                description: 'The movie ticket has been successfully cancelled.',
            });
        }).catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: `allResortMovieTickets/${booking.id} and voyagers/${booking.voyagerId}/resortMovieTickets/${booking.originalTicketId}`,
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
    
    const getStatusVariant = (status: ResortMovieTicket['status']) => {
        switch (status) {
            case 'Cancelled': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Film />
                    <span>All Movie Bookings</span>
                </CardTitle>
                <CardDescription>An overview of all movie tickets booked by voyagers.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Movie</TableHead>
                                <TableHead>Showtime</TableHead>
                                <TableHead>Seat</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Voyager</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Movie</TableHead>
                                <TableHead>Showtime</TableHead>
                                <TableHead>Seat</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Voyager</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings && bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.movieName}</TableCell>
                                        <TableCell>{format(parseISO(booking.showtime), 'MMM d, yyyy, h:mm a')}</TableCell>
                                        <TableCell>{booking.seatNumber}</TableCell>
                                        <TableCell><Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge></TableCell>
                                        <TableCell>{booking.voyagerName}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
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
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No movie bookings found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
