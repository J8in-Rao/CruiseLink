'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserProfile } from '@/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Users } from 'lucide-react';
import { useAppAuth } from '@/components/auth-provider';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function VoyagerManagementPage() {
    const { user } = useAppAuth();
    const db = useFirestore();
    
    const voyagersQuery = useMemoFirebase(() => (db && user?.role === 'admin') ? collection(db, 'voyagers') : null, [db, user]);
    const { data: allUsers, isLoading: voyagersLoading } = useCollection<UserProfile>(voyagersQuery);

    const voyagers = allUsers?.filter(u => u.role === 'voyager');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users />
                    <span>Voyager Management</span>
                </CardTitle>
                <CardDescription>View and manage all registered voyagers.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Stay Dates</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voyagersLoading ? (
                       Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                        ))
                    ) : voyagers && voyagers.length > 0 ? (
                      voyagers.map((voyager) => (
                        <TableRow key={voyager.uid}>
                          <TableCell className="font-medium">{voyager.name}</TableCell>
                          <TableCell>{voyager.email}</TableCell>
                          <TableCell>{voyager.roomNumber || 'N/A'}</TableCell>
                          <TableCell>
                            {voyager.stayStartDate && voyager.stayEndDate ?
                              `${format(parseISO(voyager.stayStartDate), 'MMM d')} - ${format(parseISO(voyager.stayEndDate), 'MMM d, yyyy')}`
                              : 'N/A'
                            }
                          </TableCell>
                          <TableCell>{voyager.role}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={5} className="text-center">No voyagers found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}