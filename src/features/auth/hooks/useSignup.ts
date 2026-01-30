import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import apiClient from "@/api/client";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

// Password complexity regex: 8+ chars, uppercase, lowercase, number, special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()\-_=+\[\]{}|;:',.<>/~`])[A-Za-z\d@$!%*?&^#()\-_=+\[\]{}|;:',.<>/~`]{8,}$/;

export const useSignup = () => {
  const t = useTranslations("auth");

  const signupSchema = z
    .object({
      name: z.string().min(2, t("nameMin") || "Name must be at least 2 characters"),
      username: z.string().min(3, t("usernameMin")),
      email: z.string().email(t("invalidEmail")),
      password: z.string()
        .min(8, t("passwordMin"))
        .regex(PASSWORD_REGEX, t("passwordComplexity")),
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
      const response = await apiClient.post("/auth/register", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.message) {
//         toast.success(data.message);
      }
    },
    onError: (error: { message?: string }) => {
      const errorMessage = error?.message || "Registration failed";
      toast.error(errorMessage);
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
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

