
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { sendWelcomeEmailAction } from './actions';
import { useTranslation } from '@/hooks/use-translation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please check your passwords and try again.',
        variant: 'destructive',
      });
      return;
    }
     if (!firstName || !lastName) {
      toast({
        title: 'Name is required',
        description: 'Please enter your first and last name.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const fullName = `${firstName} ${lastName}`;

      // Update Firebase profile
      await updateProfile(user, {
        displayName: fullName
      });

      // Create a new user object for Firestore, using the UID as the document ID
      const newUser = {
        id: user.uid,
        name: fullName,
        email: user.email!,
        registrationDate: new Date().toISOString(), // Use ISO string for consistency
        status: 'active' as const,
        orderIds: [],
      };

      // Save the new user to the 'users' collection in Firestore
      await setDoc(doc(db, "users", user.uid), newUser);
      
      toast({
        title: 'Signup Successful',
        description: "Your account has been created. You're now logged in.",
      });
      
      // Send welcome email - fire and forget
      sendWelcomeEmailAction({ name: fullName, email: user.email! }).then(result => {
          if (result.success) {
              console.log("Welcome email sent successfully.");
          } else {
              console.error("Failed to send welcome email:", result.error);
              // We don't toast this error to the user as the core signup was successful
          }
      });

      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <UserPlus className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="text-2xl font-bold mt-4">{t('auth.signupTitle')}</CardTitle>
            <CardDescription>{t('auth.signupDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('auth.haveAccount')}{' '}
            <Link href="/login" className="underline hover:text-primary">
              {t('auth.loginTitle')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

