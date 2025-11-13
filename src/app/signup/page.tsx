'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile, User as FirebaseUser } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { addDays, formatISO } from 'date-fns';
import { Eye, EyeOff, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AppLogo from '@/components/app-logo';
import { UserProfile, UserRole } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const userRoles: UserRole[] = ['voyager', 'admin', 'head-cook', 'supervisor', 'manager'];


const signupSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
    role: z.enum([...userRoles] as [string, ...string[]]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'voyager'
    },
  });

  const handleSignupError = (error: any) => {
    console.error("Signup Error:", error);
    if (error.code === 'auth/email-already-in-use') {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'This email is already registered. Please sign in.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    }
    setIsLoading(false);
  };

  const handleSignupSuccess = async (user: FirebaseUser, name: string, role: UserRole) => {
    if (!db) {
        handleSignupError(new Error("Database service is not available."));
        return;
    }

    await updateProfile(user, { displayName: name });

    const randomStartDateOffset = Math.floor(Math.random() * 30);
    const randomStayDuration = Math.floor(Math.random() * 10) + 5;
    const startDate = addDays(new Date(), randomStartDateOffset);
    const endDate = addDays(startDate, randomStayDuration);

    const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        name: name,
        role: role,
        roomNumber: `C-${Math.floor(100 + Math.random() * 900)}`,
        stayStartDate: formatISO(startDate),
        stayEndDate: formatISO(endDate),
    };
    
    const batch = writeBatch(db);

    const userDocRef = doc(db, 'voyagers', user.uid);
    batch.set(userDocRef, newUserProfile);

    // Create role documents for special roles to be used in security rules
    if (role === 'admin') {
        const adminRoleRef = doc(db, 'roles_admin', user.uid);
        batch.set(adminRoleRef, { uid: user.uid });
    } else if (role === 'head-cook') {
        const headCookRoleRef = doc(db, 'roles_head-cook', user.uid);
        batch.set(headCookRoleRef, { uid: user.uid });
    } else if (role === 'manager') {
        const managerRoleRef = doc(db, 'roles_manager', user.uid);
        batch.set(managerRoleRef, { uid: user.uid });
    } else if (role === 'supervisor') {
        const supervisorRoleRef = doc(db, 'roles_supervisor', user.uid);
        batch.set(supervisorRoleRef, { uid: user.uid });
    }
    
    batch.commit().then(() => {
        toast({
            title: 'Account Created',
            description: 'Welcome aboard! Redirecting you to the dashboard.',
        });
        router.push('/dashboard');
    }).catch((error) => {
        console.error("Failed to create user profile or role:", error);
        
        let path = `voyagers/${user.uid}`;
        if (role !== 'voyager') path += ` and /roles_${role}/${user.uid}`;

        const permissionError = new FirestorePermissionError({
            path: path,
            operation: 'create',
            requestResourceData: newUserProfile,
        });
        errorEmitter.emit('permission-error', permissionError);

        toast({
            variant: 'destructive',
            title: 'Account Setup Failed',
            description: 'Your account was created, but we failed to set up your user profile due to a permissions issue.',
        });

    }).finally(() => {
        setIsLoading(false);
    });
  };

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'Authentication service is not available. Please try again later.',
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await handleSignupSuccess(userCredential.user, data.name, data.role as UserRole);
    } catch (error) {
      handleSignupError(error);
    }
  }

  const loginHeroImage = PlaceHolderImages.find((img) => img.id === 'login-hero');

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      {loginHeroImage && (
        <Image
          src={loginHeroImage.imageUrl}
          alt={loginHeroImage.description}
          fill
          sizes="100vw"
          className="object-cover opacity-20"
          data-ai-hint={loginHeroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background z-10" />
      <Card className="w-full max-w-md z-20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AppLogo />
          </div>
          <CardTitle className="text-3xl font-headline">Create Your Account</CardTitle>
          <CardDescription>Join CruiseLink and start your journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 text-left">
              <Info className="h-4 w-4" />
              <AlertTitle>Test Credentials</AlertTitle>
              <AlertDescription className="text-xs">
                You can also log in directly with these pre-made accounts on the Sign In page.
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li><span className="font-semibold">Voyager:</span> `user1@email.com` / `user1234`</li>
                  <li><span className="font-semibold">Admin:</span> `admin@cruiselink.com` / `admin1234`</li>
                  <li><span className="font-semibold">Head-Cook:</span> `head-cook@cruiselink.com` / `headcook1234`</li>
                  <li><span className="font-semibold">Manager:</span> `manager@cruiselink.com` / `manager1234`</li>
                  <li><span className="font-semibold">Supervisor:</span> `supervisor@cruiselink.com` / `super1234`</li>
                </ul>
              </AlertDescription>
          </Alert>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="voyager@email.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                     <div className="relative">
                        <FormControl>
                          <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} disabled={isLoading} />
                        </FormControl>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" {...field} disabled={isLoading} />
                      </FormControl>
                       <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role (for development)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userRoles.map(role => (
                          <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <div className="text-sm text-muted-foreground">
            {'Already have an account? '}
            <Link href="/" className="font-medium text-primary hover:underline underline-offset-4">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
