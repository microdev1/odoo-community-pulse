'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { FormField, Input, Button } from '@/components/ui/FormComponents';
import Link from 'next/link';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        toast.error('Login failed. Please check your credentials.');
      } else {
        toast.success('Login successful!');
        router.push('/events');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
      toast.error('Login failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="py-4 px-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Log In</h1>
            <p className="text-gray-600 mt-1">
              Sign in to your Community Pulse account
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              id="email"
              label="Email"
              error={errors.email?.message}
              required
            >
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                error={!!errors.email}
                {...register('email')}
              />
            </FormField>

            <FormField
              id="password"
              label="Password"
              error={errors.password?.message}
              required
            >
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                error={!!errors.password}
                {...register('password')}
              />
            </FormField>

            <div className="mt-6">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Log In
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
