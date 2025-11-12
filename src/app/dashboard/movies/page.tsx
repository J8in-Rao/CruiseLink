'use client';

import Image from 'next/image';
import { Clock, Star, Ticket } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { useAppAuth } from '@/components/auth-provider';
import type { Movie } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function MoviesPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useAppAuth();
  
  const moviesQuery = useMemoFirebase(() => db ? collection(db, 'movies') : null, [db]);
  const { data: movies, isLoading } = useCollection<Movie>(moviesQuery);

  const handleBookTicket = (movieTitle: string, showtime: string) => {
    if (!user || !db) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'You must be signed in to book tickets.',
      });
      return;
    }

    const seatNumber = `${String.fromCharCode(65 + Math.floor(Math.random() * 10))}${Math.floor(Math.random() * 20) + 1}`;

    const ticketData = {
      voyagerId: user.uid,
      voyagerName: user.name || 'Unknown Voyager',
      movieName: movieTitle,
      showtime: new Date().toISOString(), // Placeholder, in a real app this would use the showtime
      seatNumber: seatNumber,
      status: 'Confirmed' as const,
    };

    const batch = writeBatch(db);

    // 1. Create document in user's subcollection
    const userTicketRef = doc(collection(db, 'voyagers', user.uid, 'resortMovieTickets'));
    batch.set(userTicketRef, ticketData);

    // 2. Create document in top-level collection for manager view
    const managerTicketRef = doc(collection(db, 'allResortMovieTickets'));
    batch.set(managerTicketRef, { ...ticketData, id: managerTicketRef.id, originalTicketId: userTicketRef.id });

    batch.commit()
      .then(() => {
        toast({
          title: 'Ticket Booked!',
          description: `You've booked seat ${seatNumber} for ${movieTitle} at ${showtime}.`,
        });
      })
      .catch((error) => {
        console.error('Failed to book ticket:', error);
        
        const permissionError = new FirestorePermissionError({
            path: `voyagers/${user.uid}/resortMovieTickets and/or allResortMovieTickets`,
            operation: 'create',
            requestResourceData: ticketData
        });
        errorEmitter.emit('permission-error', permissionError);

        toast({
            variant: 'destructive',
            title: 'Booking Failed',
            description: 'Could not book your ticket due to a server error. Please try again.',
        });
      });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {isLoading ? (
        Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-96" />)
      ) : movies && movies.length > 0 ? (
        movies.map((movie) => (
          <Card key={movie.id} className="flex flex-col">
            <CardHeader className="p-0 relative">
              <Image
                src={movie.imageUrl}
                alt={movie.title}
                width={500}
                height={300}
                className="object-cover w-full h-48 rounded-t-lg"
              />
               <Badge className="absolute top-2 right-2">{movie.rating}</Badge>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <CardTitle>{movie.title}</CardTitle>
              <div className="flex items-center text-muted-foreground text-sm mt-2">
                <span>{movie.genre}</span>
                <span className="mx-2">·</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>{movie.duration} min</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
               <div className="w-full">
                  <p className="text-sm font-semibold mb-2">Showtimes:</p>
                  <div className="flex flex-wrap gap-2">
                      {movie.showtimes.map(time => (
                          <Button key={time} variant="outline" size="sm" onClick={() => handleBookTicket(movie.title, time)}>
                              {time}
                          </Button>
                      ))}
                  </div>
               </div>
            </CardFooter>
          </Card>
        ))
      ) : (
        <p className="col-span-full text-center text-muted-foreground">No movies are currently scheduled.</p>
      )}
    </div>
  );
}
