"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signOut, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { loginSchema } from "@/lib/validation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setSubmitting(true);
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (result?.error) {
      setSubmitting(false);
      toast.error("Invalid email or password");
      return;
    }

    const session = await getSession();
    setSubmitting(false);

    if (session?.user?.role !== "admin") {
      await signOut({ redirect: false });
      toast.error("This account does not have admin access");
      return;
    }

    toast.success("Welcome back");
    router.push("/admin");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 bg-surface-sunken px-4">
      <div>
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <p className="text-sm text-text-subtle">Restricted access — admins only</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          id="email"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          id="password"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" loading={submitting}>
          Log in
        </Button>
      </form>
    </div>
  );
}
