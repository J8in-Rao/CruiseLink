'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addHours, format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Dumbbell } from 'lucide-react';
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
import { useAppAuth } from '@/components/auth-provider';

const equipmentList = ['Treadmill', 'Elliptical Trainer', 'Stationary Bike', 'Weight Rack'];
const timeSlots = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`); // 8 AM to 7 PM

const bookingSchema = z.object({
  equipment: z.string({ required_error: 'Please select equipment.' }),
  bookingDate: z.date({ required_error: 'Please select a date.' }),
  startTime: z.string({ required_error: 'Please select a start time.' }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function FitnessPage() {
    const { toast } = useToast();
    const db = useFirestore();
    const { user } = useAppAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
    });

    const onSubmit = (data: BookingFormValues) => {
        if (!user || !db) {
            toast({ variant: 'destructive', title: 'Booking Failed', description: 'You must be signed in.' });
            return;
        }
        setIsLoading(true);

        const startHour = parseInt(data.startTime.split(':')[0]);
        const startDateTime = new Date(data.bookingDate);
        startDateTime.setHours(startHour, 0, 0, 0);

        const endDateTime = addHours(startDateTime, 1);

        const bookingData = {
            voyagerId: user.uid,
            voyagerName: user.name || 'Unknown Voyager',
            trainingEquipment: data.equipment,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            status: 'Confirmed' as const,
        };

        const batch = writeBatch(db);

        const userBookingRef = doc(collection(db, 'voyagers', user.uid, 'fitnessCenterBookings'));
        batch.set(userBookingRef, bookingData);

        const managerBookingRef = doc(collection(db, 'allFitnessCenterBookings'));
        batch.set(managerBookingRef, { ...bookingData, id: managerBookingRef.id, originalBookingId: userBookingRef.id });

        batch.commit()
            .then(() => {
                toast({
                    title: 'Booking Confirmed!',
                    description: `Your ${data.equipment} session is booked for ${format(startDateTime, 'PPP')} from ${data.startTime} to ${format(endDateTime, 'HH:mm')}.`,
                });
                form.reset();
            })
            .catch((error) => {
                console.error('Failed to book fitness session:', error);
                const permissionError = new FirestorePermissionError({
                    path: `voyagers/${user.uid}/fitnessCenterBookings and/or allFitnessCenterBookings`,
                    operation: 'create',
                    requestResourceData: bookingData,
                });
                errorEmitter.emit('permission-error', permissionError);
                toast({
                    variant: 'destructive',
                    title: 'Booking Failed',
                    description: 'Could not book your fitness session. Please try again.',
                });
            }).finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Dumbbell />
                    <span>Fitness Center</span>
                </CardTitle>
                <CardDescription>Reserve equipment and book your workout sessions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                         <FormField
                            control={form.control}
                            name="equipment"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Equipment</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {equipmentList.map(item => (
                                        <SelectItem key={item} value={item}>{item}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                    disabled={(date) => date < new Date() || date > new Date(new Date().setDate(new Date().getDate() + 14))}
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
                                        <FormLabel>Start Time (1-hour slot)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select a time slot" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {timeSlots.map(time => (
                                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reserving...</> : 'Reserve Equipment'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
