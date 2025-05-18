'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Button } from '@/components/ui/FormComponents';
import Link from 'next/link';
import toast from 'react-hot-toast';
import axios from 'axios';
import { signIn } from 'next-auth/react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Register user
      const response = await axios.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || null,
        location: data.location || null,
      });

      if (response.status === 201) {
        toast.success('Registration successful!');

        // Automatically log in the user
        await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        router.push('/events');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="py-4 px-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-1">
              Join Community Pulse to connect with local events
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              id="name"
              label="Full Name"
              error={errors.name?.message}
              required
            >
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                error={!!errors.name}
                {...register('name')}
              />
            </FormField>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                id="confirmPassword"
                label="Confirm Password"
                error={errors.confirmPassword?.message}
                required
              >
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  error={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
              </FormField>
            </div>

            <FormField
              id="phone"
              label="Phone Number"
              error={errors.phone?.message}
              description="Optional, but useful for event reminders"
            >
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                error={!!errors.phone}
                {...register('phone')}
              />
            </FormField>

            <FormField
              id="location"
              label="Location"
              error={errors.location?.message}
              description="City or neighborhood (optional)"
            >
              <Input
                id="location"
                type="text"
                placeholder="Downtown"
                error={!!errors.location}
                {...register('location')}
              />
            </FormField>

            <div className="mt-6">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
