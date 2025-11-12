'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Message } from '@/types';
import { collection, orderBy, query } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, MessageSquare } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

type GroupedMessages = {
  [voyagerId: string]: {
    voyagerName: string;
    voyagerEmail: string;
    messages: Message[];
  };
};

export default function AdminInboxPage() {
  const db = useFirestore();
  const messagesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);

  const groupedMessages = useMemo(() => {
    if (!messages) return {};
    return messages.reduce((acc, msg) => {
      if (!acc[msg.voyagerId]) {
        acc[msg.voyagerId] = {
          voyagerName: msg.voyagerName,
          voyagerEmail: msg.voyagerEmail,
          messages: [],
        };
      }
      acc[msg.voyagerId].messages.push(msg);
      return acc;
    }, {} as GroupedMessages);
  }, [messages]);

  const sortedVoyagerIds = useMemo(() => {
    return Object.keys(groupedMessages).sort((a, b) => {
      const lastMessageA = groupedMessages[a].messages[0].createdAt;
      const lastMessageB = groupedMessages[b].messages[0].createdAt;
      return parseISO(lastMessageB).getTime() - parseISO(lastMessageA).getTime();
    });
  }, [groupedMessages]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Voyager Inbox</h2>
        <p className="text-muted-foreground">View messages and complaints from voyagers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <span>Incoming Conversations</span>
          </CardTitle>
          <CardDescription>
            Messages are grouped by voyager and ordered from newest to oldest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : sortedVoyagerIds && sortedVoyagerIds.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {sortedVoyagerIds.map((voyagerId) => {
                const convo = groupedMessages[voyagerId];
                const latestMessage = convo.messages[0];
                return (
                  <AccordionItem key={voyagerId} value={voyagerId}>
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-4 text-left">
                            <Avatar>
                                <AvatarImage src={`https://picsum.photos/seed/${voyagerId}/40/40`} />
                                <AvatarFallback>{convo.voyagerName?.charAt(0) || 'V'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className='flex items-center gap-2'>
                                    <p className="font-semibold">{convo.voyagerName}</p>
                                    <Badge variant="outline">{convo.messages.length} {convo.messages.length > 1 ? 'messages' : 'message'}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate max-w-md">{latestMessage.content}</p>
                            </div>
                        </div>
                         <p className="text-xs text-muted-foreground self-start shrink-0 ml-4">
                            {format(parseISO(latestMessage.createdAt), 'MMM d, h:mm a')}
                        </p>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pl-14 pr-4">
                        {convo.messages.map((msg, index) => (
                           <div key={msg.id} className={`flex flex-col ${index > 0 ? 'border-t pt-4' : ''}`}>
                             <div className="flex justify-between items-center mb-2">
                               <p className="text-xs font-medium text-muted-foreground">
                                   Message #{convo.messages.length - index}
                               </p>
                               <p className="text-xs text-muted-foreground">
                                 {format(parseISO(msg.createdAt), 'MMM d, yyyy, h:mm a')}
                               </p>
                             </div>
                             <p className="text-sm">{msg.content}</p>
                           </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-16">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Inbox is Empty</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                There are no new messages or complaints from voyagers.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
