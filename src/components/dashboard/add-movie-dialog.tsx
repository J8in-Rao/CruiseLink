'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Movie } from '@/types';
import { Loader2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const movieSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  genre: z.string().min(1, 'Genre is required'),
  duration: z.coerce.number().min(1, 'Duration must be greater than 0'),
  rating: z.string().min(1, 'Rating is required'),
  imageUrl: z.string().min(1, 'A movie banner is required.'),
  showtimes: z.array(z.string()).min(1, 'At least one showtime is required.'),
});

type MovieFormValues = z.infer<typeof movieSchema>;

type AddMovieDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  movie?: Movie;
};

const genres = ["Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Family", "Thriller", "Romance"];
const ratings = ["G", "PG", "PG-13", "R", "NC-17"];

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutes = ['00', '15', '30', '45'];
const periods = ['AM', 'PM'];

export function AddMovieDialog({ isOpen, setIsOpen, movie }: AddMovieDialogProps) {
  const isEditMode = !!movie;
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');

  // Showtime input state
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('PM');

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: '',
      genre: '',
      duration: 0,
      rating: '',
      imageUrl: '',
      showtimes: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (movie) {
            form.reset(movie);
             if (movie.imageUrl.startsWith('data:image')) {
                setImageSource('upload');
            } else {
                setImageSource('url');
            }
        } else {
            form.reset({ title: '', genre: '', duration: 120, rating: 'PG-13', imageUrl: '', showtimes: [] });
            setImageSource('url');
        }
    }
  }, [movie, form, isOpen]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('imageUrl', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddShowtime = () => {
      const newShowtime = `${hour}:${minute} ${period}`;
      const currentShowtimes = form.getValues('showtimes');
      if (!currentShowtimes.includes(newShowtime)) {
        form.setValue('showtimes', [...currentShowtimes, newShowtime].sort(), { shouldValidate: true });
      }
  };

  const handleRemoveShowtime = (index: number) => {
    const currentShowtimes = form.getValues('showtimes');
    form.setValue('showtimes', currentShowtimes.filter((_, i) => i !== index));
  };


  const onSubmit = async (data: MovieFormValues) => {
    if (!db) return;
    setIsLoading(true);
    
    try {
      if (isEditMode && movie?.id) {
        await setDoc(doc(db, 'movies', movie.id), data);
        toast({ title: 'Success', description: 'Movie updated successfully.' });
      } else {
        await addDoc(collection(db, 'movies'), data);
        toast({ title: 'Success', description: 'Movie added successfully.' });
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save movie:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save movie.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit' : 'Add'} Movie</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this movie.' : 'Add a new movie to the theater listing.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register('title')} disabled={isLoading}/>
            {form.formState.errors.title && <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Controller
                control={form.control}
                name="genre"
                render={({ field }) => (
                    <div className="space-y-2">
                        <Label>Genre</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isLoading}>
                            <SelectTrigger><SelectValue placeholder="Select genre..." /></SelectTrigger>
                            <SelectContent>
                                {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.genre && <p className="text-destructive text-sm">{form.formState.errors.genre.message}</p>}
                    </div>
                )}
            />
            <Controller
                control={form.control}
                name="rating"
                render={({ field }) => (
                    <div className="space-y-2">
                        <Label>Rating</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isLoading}>
                           <SelectTrigger><SelectValue placeholder="Select rating..." /></SelectTrigger>
                           <SelectContent>
                                {ratings.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         {form.formState.errors.rating && <p className="text-destructive text-sm">{form.formState.errors.rating.message}</p>}
                    </div>
                )}
            />
          </div>
        
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (in minutes)</Label>
            <Input id="duration" type="number" {...form.register('duration')} disabled={isLoading}/>
            {form.formState.errors.duration && <p className="text-destructive text-sm">{form.formState.errors.duration.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Movie Banner</Label>
            <RadioGroup defaultValue="url" value={imageSource} onValueChange={(value: 'url' | 'upload') => setImageSource(value)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="url" disabled={isLoading} />
                <Label htmlFor="url">URL</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" disabled={isLoading}/>
                <Label htmlFor="upload">Upload</Label>
              </div>
            </RadioGroup>
          </div>

          {imageSource === 'url' ? (
            <Input
                id="imageUrl"
                placeholder="https://example.com/image.png"
                {...form.register('imageUrl')}
                disabled={isLoading}
            />
          ) : (
             <Input
                id="imageUpload"
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileChange}
                disabled={isLoading}
              />
          )}
          {form.formState.errors.imageUrl && <p className="text-destructive text-sm">{form.formState.errors.imageUrl.message}</p>}
          
          <div className="space-y-2">
            <Label>Showtimes</Label>
            <div className="flex gap-2 items-center">
                <Select value={hour} onValueChange={setHour} disabled={isLoading}>
                    <SelectTrigger className="w-20"><SelectValue/></SelectTrigger>
                    <SelectContent>{hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
                <span>:</span>
                <Select value={minute} onValueChange={setMinute} disabled={isLoading}>
                    <SelectTrigger className="w-20"><SelectValue/></SelectTrigger>
                    <SelectContent>{minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
                 <Select value={period} onValueChange={setPeriod} disabled={isLoading}>
                    <SelectTrigger className="w-24"><SelectValue/></SelectTrigger>
                    <SelectContent>{periods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="button" onClick={handleAddShowtime} disabled={isLoading}>Add</Button>
            </div>
            {form.formState.errors.showtimes && <p className="text-destructive text-sm">{form.formState.errors.showtimes.message}</p>}
            <div className="flex flex-wrap gap-2 pt-2">
                {form.watch('showtimes').map((time, index) => (
                    <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-sm">
                        <span>{time}</span>
                        <button type="button" onClick={() => handleRemoveShowtime(index)} disabled={isLoading} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Saving...' : 'Save Movie'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
