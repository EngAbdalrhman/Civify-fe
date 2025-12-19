import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import apiClient from "@/api/client";
import { useTranslations } from "next-intl";

export const useLogin = () => {
  const t = useTranslations("auth");

  const loginSchema = z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(1, t("passwordRequired")),
  });

  type LoginSchemaType = z.infer<typeof loginSchema>;

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const {
    mutate: login,
    isPending: isLoginPending,
    isSuccess: isLoginSuccess,
    error: loginError,
  } = useMutation({
    mutationFn: async (data: LoginSchemaType) => {
      // Backend expects /login endpoint (with /apis context path)
      const response = await apiClient.post("/login", {
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
  });

  return {
    form,
    login,
    isLoginPending,
    isLoginSuccess,
    loginError,
  };
};

export type LoginSchemaType = {
  email: string;
  password: string;
};
