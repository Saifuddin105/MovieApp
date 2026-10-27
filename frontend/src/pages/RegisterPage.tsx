import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';
import { Film, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(60),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setErrorMessage(null);
      await registerAuth({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'An error occurred during registration. Please try again.',
      );
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#11151e] border border-border/80 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-bold shadow-glow">
              <Film className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-extrabold text-xl text-slate-100">
              What Should I Watch?
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-100">Create Your Account</h2>
          <p className="text-xs text-slate-400">
            Build your personalized movie discovery watchlist and log what you watch
          </p>
        </div>

        {/* Server Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Alex Morgan"
            icon={<UserIcon className="w-4 h-4" />}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            icon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Create Free Account
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-border/80 w-full" />
          <span className="bg-[#11151e] px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
            Or sign up with
          </span>
          <div className="border-t border-border/80 w-full" />
        </div>

        <GoogleAuthButton
          mode="signup"
          fromPath="/"
          onError={(err) => setErrorMessage(err)}
        />

        <div className="text-center pt-2 border-t border-border/60">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

