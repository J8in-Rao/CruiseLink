'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, PartyPopper } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, writeBatch, collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { useAppAuth } from '@/components/auth-provider';

const hallTypes = ['Birthday Celebration', 'Anniversary Dinner', 'Corporate Meeting', 'Family Reunion'];

const bookingSchema = z.object({
  hallType: z.string({ required_error: 'Please select a hall type.' }),
  bookingDate: z.date({ required_error: 'Please select a date.' }),
  startTime: z.number().min(8).max(21), // 8 AM to 9 PM
  duration: z.number().min(1).max(4),   // 1 to 4 hours
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function PartyHallPage() {
    const { toast } = useToast();
    const db = useFirestore();
    const { user } = useAppAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: { startTime: 17, duration: 2 } // Default to 5 PM for 2 hours
    });

    const onSubmit = (data: BookingFormValues) => {
        if (!user || !db) {
            toast({ variant: 'destructive', title: 'Booking Failed', description: 'You must be signed in.' });
            return;
        }
        setIsLoading(true);

        const startDateTime = new Date(data.bookingDate);
        startDateTime.setHours(data.startTime, 0, 0, 0);

        const endDateTime = new Date(startDateTime.getTime() + data.duration * 60 * 60 * 1000);

        const bookingData = {
            voyagerId: user.uid,
            voyagerName: user.name || 'Unknown Voyager',
            hallType: data.hallType,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            status: 'Confirmed' as const,
        };

        const batch = writeBatch(db);

        const userBookingRef = doc(collection(db, 'voyagers', user.uid, 'partyHallBookings'));
        batch.set(userBookingRef, bookingData);

        const managerBookingRef = doc(collection(db, 'allPartyHallBookings'));
        batch.set(managerBookingRef, { ...bookingData, id: managerBookingRef.id, originalBookingId: userBookingRef.id });

        batch.commit()
            .then(() => {
                toast({
                    title: 'Hall Booked!',
                    description: `The hall for your ${data.hallType} is booked on ${format(startDateTime, 'PPP')} from ${format(startDateTime, 'h a')} to ${format(endDateTime, 'h a')}.`,
                });
                form.reset({ startTime: 17, duration: 2 });
            })
            .catch((error) => {
                console.error('Failed to book party hall:', error);
                const permissionError = new FirestorePermissionError({
                    path: `voyagers/${user.uid}/partyHallBookings and/or allPartyHallBookings`,
                    operation: 'create',
                    requestResourceData: bookingData,
                });
                errorEmitter.emit('permission-error', permissionError);
                toast({
                    variant: 'destructive',
                    title: 'Booking Failed',
                    description: 'Could not book the hall. Please try again.',
                });
            }).finally(() => {
                setIsLoading(false);
            });
    };

    const formatHour = (hour: number) => {
        const d = new Date();
        d.setHours(hour);
        return format(d, 'h a');
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PartyPopper />
                    <span>Party Hall</span>
                </CardTitle>
                <CardDescription>Book a hall for your special occasions and celebrations.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="hallType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select an event type" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {hallTypes.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bookingDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant={'outline'} className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date() || date > new Date(new Date().setDate(new Date().getDate() + 60))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Time: {formatHour(field.value)}</FormLabel>
                                    <FormControl>
                                        <Slider
                                            onValueChange={(value) => field.onChange(value[0])}
                                            defaultValue={[field.value]}
                                            max={21}
                                            min={8}
                                            step={1}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration: {field.value} hour{field.value > 1 ? 's' : ''}</FormLabel>
                                    <FormControl>
                                        <Slider
                                            onValueChange={(value) => field.onChange(value[0])}
                                            defaultValue={[field.value]}
                                            max={4}
                                            min={1}
                                            step={1}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Booking Hall...</> : 'Book Hall'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
