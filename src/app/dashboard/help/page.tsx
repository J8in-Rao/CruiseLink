'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAppAuth } from '@/components/auth-provider';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { LifeBuoy, Loader2 } from 'lucide-react';

const helpSchema = z.object({
  message: z.string().min(10, { message: 'Message must be at least 10 characters long.' }).max(500, { message: 'Message must be 500 characters or less.' }),
});

type HelpFormValues = z.infer<typeof helpSchema>;

export default function HelpPage() {
  const { user } = useAppAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<HelpFormValues>({
    resolver: zodResolver(helpSchema),
    defaultValues: {
      message: '',
    },
  });

  const onSubmit = async (data: HelpFormValues) => {
    if (!user || !db) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not send message. User not authenticated.',
        });
        return;
    }
    setIsLoading(true);

    try {
        await addDoc(collection(db, 'messages'), {
            voyagerId: user.uid,
            voyagerName: user.name,
            voyagerEmail: user.email,
            content: data.message,
            createdAt: new Date().toISOString(),
            status: 'new'
        });
        toast({
            title: 'Message Sent!',
            description: 'An admin will get back to you shortly.',
        });
        form.reset();
    } catch (error) {
        console.error('Failed to send message:', error);
        toast({
            variant: 'destructive',
            title: 'Failed to Send',
            description: 'Could not send your message. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-primary" />
            <span>Help Center</span>
        </CardTitle>
        <CardDescription>
          Have a question or a problem? Send a message to our support team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Message</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="Please describe your issue or question in detail..." 
                                    {...field}
                                    rows={6}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        'Send Message'
                    )}
                </Button>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}
