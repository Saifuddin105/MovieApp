import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';
import { Film, Lock, Mail, AlertCircle, Info } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage(null);
      await login(data);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Invalid email or password. Please try again.',
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#11151e] border border-border/80 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-bold shadow-glow">
              <Film className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-extrabold text-xl text-slate-100">
              What Should I Watch?
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your personal watchlist and watched history
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
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="text-xs text-amber-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-border/80 w-full" />
          <span className="bg-[#11151e] px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
            Or continue with
          </span>
          <div className="border-t border-border/80 w-full" />
        </div>

        <GoogleAuthButton
          mode="signin"
          fromPath={from}
          onError={(err) => setErrorMessage(err)}
        />

        <div className="text-center pt-2 border-t border-border/60">
          <p className="text-xs text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="text-amber-400 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        title="Password Recovery"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
            <Info className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <p className="leading-relaxed">
              For portfolio demonstration purposes, accounts are self-contained. If you forget your
              credentials, you can register a new test account instantly with any email. In production,
              password reset tokens are delivered via SMTP/Postmark integration.
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setForgotPasswordOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

