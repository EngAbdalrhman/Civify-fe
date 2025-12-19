"use client";
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/routing';
import { useLogin, LoginSchemaType } from '@/features/auth/hooks';
import { SubmitHandler } from 'react-hook-form';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { form, login, isLoginPending, isLoginSuccess } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<LoginSchemaType> = (data) => {
    login(data);
  };

  // Redirect on successful login
  if (isLoginSuccess) {
    router.push('/app');
  }

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8077/apis';
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('login')}</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Please login to your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('email')}</label>
            <input 
              type="email" 
              {...register('email')}
              className="w-full rounded-md border px-3 py-2"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('password')}</label>
            <input 
              type="password" 
              {...register('password')}
              className="w-full rounded-md border px-3 py-2"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" />
              {t('rememberMe')}
            </label>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              {t('forgotPassword')}
            </Link>
          </div>

          <Button className="w-full" disabled={isLoginPending}>
            {isLoginPending ? 'Logging in...' : t('login')}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button 
            type="button"
            variant="outline" 
            className="w-full"
            onClick={handleGoogleLogin}
          >
            {t('loginWithGoogle')}
          </Button>
        </form>

        <p className="text-center text-sm">
          {t('noAccount')}{' '}
          <Link href="/signup" className="text-primary hover:underline">
            {t('signup')}
          </Link>
        </p>
      </div>
    </div>
  );
}
