"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/routing";
import { SubmitHandler } from "react-hook-form";
import { useSignup, SignupSchemaType } from "@/features/auth/hooks";

export default function SignupPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { form, signup, isSignupPending, isSignupSuccess } = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<SignupSchemaType> = (data) => {
    signup(data);
  };

  if (isSignupSuccess) {
    router.push("/app");
  }

  const handleGoogleSignup = () => {
    // Redirect to backend Google OAuth endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8077/apis';
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("signup")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-lg border p-6 space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("username")}</label>
            <input
              type="text"
              {...register("username")}
              className="w-full rounded-md border px-3 py-2"
              placeholder={t("username")}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("email")}</label>
            <input
              type="email"
              {...register("email")}
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
            <label className="text-sm font-medium">{t("password")}</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-md border px-3 py-2"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("confirmPassword")}
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="w-full rounded-md border px-3 py-2"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" required className="rounded border-gray-300 text-primary focus:ring-primary" />
            <span>
              {t.rich('terms', {
                terms: (chunks) => <Link href="/terms" className="underline hover:text-foreground">{chunks}</Link>,
                privacy: (chunks) => <Link href="/policy" className="underline hover:text-foreground">{chunks}</Link>
              })}
            </span>
          </label>

          <Button className="w-full" disabled={isSignupPending}>
            {t("signup")}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("orContinueWith")}
              </span>
            </div>
          </div>

          <Button 
            type="button"
            variant="outline" 
            className="w-full"
            onClick={handleGoogleSignup}
          >
            {t("signupWithGoogle")}
          </Button>
        </form>

        <p className="text-center text-sm">
          {t("hasAccount")}{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
