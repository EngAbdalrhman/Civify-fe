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
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8077/apis";
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  const handleLinkedInSignup = () => {
    // Redirect to backend LinkedIn OAuth endpoint
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8077/apis";
    window.location.href = `${backendUrl}/oauth2/authorization/linkedin`;
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
            <label className="text-sm font-medium">{t("name") || "Name"}</label>
            <input
              type="text"
              {...register("name")}
              className="w-full rounded-md border px-3 py-2"
              placeholder={t("namePlaceholder") || "John Doe"}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

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
            <input
              type="checkbox"
              required
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>
              {t.rich("terms", {
                terms: (chunks) => (
                  <Link
                    href="/terms"
                    className="underline hover:text-foreground"
                  >
                    {chunks}
                  </Link>
                ),
                privacy: (chunks) => (
                  <Link
                    href="/policy"
                    className="underline hover:text-foreground"
                  >
                    {chunks}
                  </Link>
                ),
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
            className="w-full hover:bg-white hover:text-primary transition-all duration-200 ease-in-out"
            onClick={handleGoogleSignup}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t("signupWithGoogle")}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full hover:bg-white hover:text-primary transition-all duration-200 ease-in-out mt-2"
            onClick={handleLinkedInSignup}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                fill="#0077B5"
              />
            </svg>
            {t("signupWithLinkedIn")}
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
