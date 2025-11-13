
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Ship, Eye, EyeOff, Info, KeyRound } from 'lucide-react';

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
import { useAuth, useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AppLogo from '@/components/app-logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Authentication service is not available. Please try again later.',
      });
      setIsLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: 'Login Successful',
        description: "Welcome back! You're being redirected to your dashboard.",
      });
      // The useEffect hook will handle the redirect now
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Authentication service is not available. Please try again later.',
      });
      setIsLoading(false);
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: 'Login Successful',
        description: "Welcome! You're being redirected to your dashboard.",
      });
      // The useEffect hook will handle the redirect now
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Could not sign in with Google. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const loginHeroImage = PlaceHolderImages.find((img) => img.id === 'login-hero');

  // Don't render the form if we are still checking the user's auth state
  // or if the user object exists (which means we are about to redirect).
  if (isUserLoading || user) {
    return (
       <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background">
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
         <div className="z-20 flex flex-col items-center gap-4">
            <AppLogo size="lg" />
            <p className="text-muted-foreground">Loading...</p>
         </div>
       </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4">
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
      
      <div className="z-20 flex justify-center w-full max-w-md">
        <Card className="w-full shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <AppLogo />
            </div>
            <CardTitle className="text-3xl font-headline">Welcome to CruiseLink</CardTitle>
            <CardDescription>Your voyage, simplified. Sign in to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 text-left">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Hint: Use `admin@cruiselink.com`, `manager@cruiselink.com`, etc. to test different roles. Any other email will be a standard 'voyager'.
              </AlertDescription>
            </Alert>

            <Accordion type="single" collapsible className="w-full mb-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm">View Test Credentials</AccordionTrigger>
                <AccordionContent>
                  <Card className="bg-muted/50 border-dashed">
                      <CardHeader className="p-4">
                          <CardTitle className="flex items-center gap-2 text-base"><KeyRound/> Test Accounts</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs p-4 pt-0">
                          <ul className="space-y-3">
                            <li><span className="font-semibold text-foreground">Voyager:</span> <br/> <span className="text-muted-foreground">user1@email.com / user1234</span></li>
                            <li><span className="font-semibold text-foreground">Admin:</span> <br/> <span className="text-muted-foreground">admin@cruiselink.com / admin1234</span></li>
                            <li><span className="font-semibold text-foreground">Head-Cook:</span> <br/> <span className="text-muted-foreground">head-cook@cruiselink.com / headcook1234</span></li>
                            <li><span className="font-semibold text-foreground">Manager:</span> <br/> <span className="text-muted-foreground">manager@cruiselink.com / manager1234</span></li>
                            <li><span className="font-semibold text-foreground">Supervisor:</span> <br/> <span className="text-muted-foreground">supervisor@cruiselink.com / super1234</span></li>
                          </ul>
                      </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="voyager@cruiselink.com" {...field} disabled={isLoading} />
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In with Email'}
                </Button>
              </form>
            </Form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" onClick={handleGoogleSignIn} disabled={isLoading}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 400.2 0 261.8 0 123.3 111.8 11.8 244 11.8c70.3 0 129.8 28.7 173.4 74.9l-67.4 64.8C331.7 131 292.5 111.8 244 111.8c-88.3 0-160.1 71.8-160.1 160.1s71.8 160.1 160.1 160.1c94.9 0 135.6-70.3 140.8-106.9H244v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 42.5z"></path></svg>
                Google
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            <div className="text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/signup" className="font-medium text-primary hover:underline underline-offset-4">
                Sign Up
              </Link>
            </div>
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot your password?
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
