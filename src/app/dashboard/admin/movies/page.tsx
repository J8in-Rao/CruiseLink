'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import type { Movie } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddMovieDialog } from '@/components/dashboard/add-movie-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Film, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MovieManagementPage() {
    const db = useFirestore();
    const moviesQuery = useMemoFirebase(() => db ? collection(db, 'movies') : null, [db]);
    const { data: movies, isLoading } = useCollection<Movie>(moviesQuery);
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | undefined>(undefined);

    const openAddDialog = () => {
        setSelectedMovie(undefined);
        setDialogOpen(true);
    };
    
    const openEditDialog = (movie: Movie) => {
        setSelectedMovie(movie);
        setDialogOpen(true);
    };

    const handleDelete = async (itemId: string) => {
        if (!db) return;
        if (confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
            await deleteDoc(doc(db, 'movies', itemId));
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Film />
                        <span>Movie Management</span>
                    </CardTitle>
                    <CardDescription>Add, edit, or remove movies available for viewing on the cruise.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <Button onClick={openAddDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Movie
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Genre</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                                ))
                            ) : movies && movies.length > 0 ? (
                                movies.map((movie) => (
                                    <TableRow key={movie.id}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                            <Image src={movie.imageUrl} alt={movie.title} width={40} height={60} className="rounded-sm object-cover" />
                                            <span>{movie.title}</span>
                                        </TableCell>
                                        <TableCell>{movie.genre}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4 text-muted-foreground"/>
                                                {movie.duration} min
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{movie.rating}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => openEditDialog(movie)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(movie.id)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">No movies found. Add one to get started.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <AddMovieDialog 
                isOpen={dialogOpen}
                setIsOpen={setDialogOpen}
                movie={selectedMovie}
            />
        </>
    );
}
