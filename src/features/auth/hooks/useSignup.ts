import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import apiClient from "@/api/client";
import { useTranslations } from "next-intl";

export const useSignup = () => {
  const t = useTranslations("auth");

  const signupSchema = z
    .object({
      username: z.string().min(3, t("usernameMin")),
      email: z.email(),
      password: z.string().min(8, t("passwordMin")),
      confirmPassword: z.string().min(8, t("confirmPasswordMin")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMatch"),
      path: ["confirmPassword"],
    });

  type SignupSchemaType = z.infer<typeof signupSchema>;

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
  });

  const {
    mutate: signup,
    isPending: isSignupPending,
    isSuccess: isSignupSuccess,
  } = useMutation({
    mutationFn: async (data: SignupSchemaType) => {
      const response = await apiClient.post("/auth/signup", data);
      return response.data;
    },
  });

  return {
    form,
    signup,
    isSignupPending,
    isSignupSuccess,
  };
};

export type SignupSchemaType = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};
