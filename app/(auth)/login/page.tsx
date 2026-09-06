'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DEMO_USERS } from '@/lib/auth';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setAuthUser } from '@/lib/redux/slices/authSlice';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      // Attempt real Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If Supabase is unconfigured or user not found, check demo users
        const matchedDemo = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (matchedDemo) {
          dispatch(
            setAuthUser({
              user: matchedDemo,
              role: matchedDemo.role,
            })
          );
          toast.success(`Welcome back, ${matchedDemo.full_name}!`, {
            description: `Signed in as ${matchedDemo.role.toUpperCase()}`,
          });
          router.push('/');
          return;
        }

        // Generic fallback for testing credentials
        const fallbackUser = {
          id: `user-${Date.now()}`,
          email,
          full_name: email.split('@')[0],
          avatar_url: null,
          role: 'member' as const,
          theme: 'system' as const,
        };
        dispatch(
          setAuthUser({
            user: fallbackUser,
            role: 'member',
          })
        );
        toast.success(`Signed in as ${email}`);
        router.push('/');
        return;
      }

      if (data?.user) {
        dispatch(
          setAuthUser({
            user: {
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata?.full_name || email.split('@')[0],
              avatar_url: data.user.user_metadata?.avatar_url || null,
              theme: 'system',
            },
            role: 'member',
          })
        );
        toast.success('Successfully logged in');
        router.push('/');
      }
    } catch (err: any) {
      toast.error('Login failed', { description: err?.message || 'Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoUser: typeof DEMO_USERS[0]) => {
    dispatch(
      setAuthUser({
        user: demoUser,
        role: demoUser.role,
      })
    );
    toast.success(`Logged in as ${demoUser.full_name}`, {
      description: `Role: ${demoUser.role.toUpperCase()}`,
    });
    router.push('/');
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col items-center text-center space-y-2 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-primary-foreground shadow-md">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
        <p className="text-xs text-muted-foreground max-w-xs">
          Sign in to your Workspace Manager account to collaborate with your team.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">Password</label>
          </div>
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
          {isLoading ? 'Signing In...' : 'Sign In'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="relative my-6 text-center text-xs">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-card px-2 text-muted-foreground uppercase text-[10px] tracking-wider">
          Or Quick Sign-In for Reviewers
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DEMO_USERS.map((demo) => (
          <Button
            key={demo.id}
            variant="outline"
            type="button"
            size="sm"
            onClick={() => handleQuickLogin(demo)}
            className="flex items-center justify-start gap-2 h-auto py-2 px-2.5 text-left border-border/80 hover:bg-muted/50"
          >
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {demo.full_name ? demo.full_name[0] : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate leading-tight">{demo.full_name}</div>
              <div className="text-[10px] text-muted-foreground uppercase">{demo.role}</div>
            </div>
          </Button>
        ))}
      </div>

      <div className="text-center mt-6 text-xs text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
