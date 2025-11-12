'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Scissors } from 'lucide-react';
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

const salonServices = ['Haircut & Style', 'Manicure & Pedicure', 'Facial Treatment', 'Massage Therapy'];
const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

const bookingSchema = z.object({
  serviceType: z.string({ required_error: 'Please select a service.' }),
  appointmentDate: z.date({ required_error: 'Please select a date.' }),
  appointmentTime: z.string({ required_error: 'Please select a time.' }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function SalonPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useAppAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = (data: BookingFormValues) => {
    if (!user || !db) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'You must be signed in to make a booking.',
      });
      return;
    }
    setIsLoading(true);
    
    const appointmentDateTime = new Date(data.appointmentDate);
    const [hours, minutes, period] = data.appointmentTime.match(/(\d+):(\d+) (AM|PM)/)!.slice(1);
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    appointmentDateTime.setHours(hour, parseInt(minutes));

    const bookingData = {
        voyagerId: user.uid,
        voyagerName: user.name || 'Unknown Voyager',
        serviceType: data.serviceType,
        appointmentTime: appointmentDateTime.toISOString(),
        status: 'Confirmed' as const,
    };

    const batch = writeBatch(db);

    // 1. Create in user's subcollection
    const userBookingRef = doc(collection(db, 'voyagers', user.uid, 'beautySalonBookings'));
    batch.set(userBookingRef, bookingData);

    // 2. Create in top-level collection
    const managerBookingRef = doc(collection(db, 'allBeautySalonBookings'));
    batch.set(managerBookingRef, { ...bookingData, id: managerBookingRef.id, originalBookingId: userBookingRef.id });

    batch.commit()
      .then(() => {
        toast({
          title: 'Booking Confirmed!',
          description: `Your ${data.serviceType} is booked for ${format(appointmentDateTime, 'PPP, h:mm a')}.`,
        });
        form.reset();
      })
      .catch((error) => {
        console.error('Failed to book appointment:', error);
        const permissionError = new FirestorePermissionError({
          path: `voyagers/${user.uid}/beautySalonBookings and/or allBeautySalonBookings`,
          operation: 'create',
          requestResourceData: bookingData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Booking Failed',
          description: 'Could not book your appointment. Please try again.',
        });
      }).finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Scissors />
            <span>Beauty Salon</span>
        </CardTitle>
        <CardDescription>Book an appointment for our luxurious salon services.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {salonServices.map(service => (
                        <SelectItem key={service} value={service}>{service}</SelectItem>
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
                name="appointmentDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={'outline'}
                            className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                            )}
                            >
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
                            disabled={(date) => date < new Date() || date > new Date(new Date().setDate(new Date().getDate() + 30))}
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
                    name="appointmentTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a time" />
                            </SelectTrigger>
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
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Booking...</> : 'Book Appointment'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
