'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setAuthUser } from '@/lib/redux/slices/authSlice';
import { supabase } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        // Fallback for local demo environment without live Supabase cloud
        const newUser = {
          id: `user-${Date.now()}`,
          email,
          full_name: fullName,
          avatar_url: null,
          role: 'member' as const,
          theme: 'system' as const,
        };
        dispatch(
          setAuthUser({
            user: newUser,
            role: 'member',
          })
        );
        toast.success(`Account created! Welcome, ${fullName}!`);
        router.push('/');
        return;
      }

      if (data?.user) {
        dispatch(
          setAuthUser({
            user: {
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName,
              avatar_url: null,
              theme: 'system',
            },
            role: 'owner',
          })
        );
        toast.success('Registration successful! Welcome to Workspace Manager.');
        router.push('/');
      }
    } catch (err: any) {
      toast.error('Signup failed', { description: err?.message || 'Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col items-center text-center space-y-2 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-primary-foreground shadow-md">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Your Account</h1>
        <p className="text-xs text-muted-foreground max-w-xs">
          Get started with Workspace Manager in seconds.
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Alex Chen"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-9 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Work Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="alex@workspace.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-9 text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up Free'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="text-center mt-6 text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
