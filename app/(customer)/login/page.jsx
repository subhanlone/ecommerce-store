"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { loginSchema } from "@/lib/validation";
import { mergeGuestCartOnLogin, mergeGuestWishlistOnLogin } from "@/lib/mergeGuestCart";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    setSubmitting(false);

    if (result?.error) {
      toast.error("Invalid email or password");
      return;
    }

    toast.success("Logged in");
    await Promise.all([mergeGuestCartOnLogin(), mergeGuestWishlistOnLogin()]);
    router.push(searchParams.get("callbackUrl") || "/");
  };

  return (
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
      <Button type="submit" disabled={submitting}>
        {submitting ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading...</p>}>
        <LoginForm />
      </Suspense>
      <p className="text-sm text-neutral-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
