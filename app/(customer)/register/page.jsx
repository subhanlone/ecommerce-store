"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { registerSchema } from "@/lib/validation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setSubmitting(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || "Something went wrong");
      setSubmitting(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setSubmitting(false);

    if (signInResult?.error) {
      toast.success("Account created, please log in");
      router.push("/login");
      return;
    }

    toast.success("Account created");
    router.push("/");
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Name"
          id="name"
          error={errors.name?.message}
          {...register("name")}
        />
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
          Sign up
        </Button>
      </form>
      <p className="text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
